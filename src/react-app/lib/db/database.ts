import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

/**
 * Initialize or get existing PGlite instance from window
 * Prevents re-instantiation during HMR in dev mode
 */
if (!window.pg_lite) {
  window.pg_lite = (await PGlite.create({
    dataDir: 'idb://playground-webmcp-db',
    relaxedDurability: true,
    extensions: { live },
  }));
}

/**
 * Initialize or get existing Drizzle instance from window
 */
if (!window.db) {
  window.db = drizzle(window.pg_lite, { schema });
}

/**
 * Drizzle ORM instance - always use from window
 */
export const db = window.db;

/**
 * Raw PGlite client - always use from window
 */
export const pg_lite = window.pg_lite;

/**
 * Database utility functions
 * Always uses window.db and window.pg_lite for consistency
 */
export const db_utils = {
  /**
   * Clear all data from the database
   */
  async clear_all() {
    await window.db.delete(schema.entity_mentions);
    await window.db.delete(schema.entity_relationships);
    await window.db.delete(schema.conversation_messages);
    await window.db.delete(schema.conversation_sessions);
    await window.db.delete(schema.memory_entities);
    await window.db.delete(schema.memory_blocks);
    await window.db.delete(schema.memory_retrieval_logs);
  },

  /**
   * Reset database by dropping and recreating all tables
   * Note: DROP TABLE operations require raw SQL - Drizzle doesn't support DDL
   */
  async reset() {
    // For DDL operations like DROP TABLE, we must use raw SQL
    // This is the only acceptable use of pg_lite.exec for schema changes
    await window.pg_lite.exec(`
      DROP TABLE IF EXISTS entity_mentions CASCADE;
      DROP TABLE IF EXISTS entity_relationships CASCADE;
      DROP TABLE IF EXISTS conversation_messages CASCADE;
      DROP TABLE IF EXISTS conversation_sessions CASCADE;
      DROP TABLE IF EXISTS memory_entities CASCADE;
      DROP TABLE IF EXISTS memory_blocks CASCADE;
      DROP TABLE IF EXISTS memory_retrieval_logs CASCADE;
    `);

    // Recreate tables - run migrations
    await this.migrate();
  },

  /**
   * Run database migrations using Drizzle's migration system
   * Migrations are pre-compiled to JSON for browser compatibility
   */
  async migrate() {
    const { runMigrations } = await import('./migrate');
    await runMigrations();

    // Run custom migrations
    await this.runCustomMigrations();
  },

  /**
   * Run custom TypeScript migrations (not part of Drizzle)
   */
  async runCustomMigrations() {
    // Check if audit_log table exists using Drizzle
    const auditTableCheck = await window.db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'audit_log'
      ) as exists;
    `);

    const auditLogExists = (auditTableCheck.rows[0] as { exists: boolean })?.exists === true;

    // Always update the audit log trigger function to fix the entity_contexts issue
    if (auditLogExists) {
      console.log('[DB] Updating audit log trigger function to fix entity_contexts...');
      // Drop and recreate the trigger function to fix the entity_contexts issue
      await window.pg_lite.exec(`
        CREATE OR REPLACE FUNCTION audit_trigger_function()
        RETURNS TRIGGER AS $$
        DECLARE
          changed_fields TEXT[];
          old_json JSONB;
          new_json JSONB;
          rec_id UUID;
        BEGIN
          -- Convert records to JSONB
          IF TG_OP = 'DELETE' THEN
            old_json := to_jsonb(OLD);
            new_json := NULL;
          ELSIF TG_OP = 'INSERT' THEN
            old_json := NULL;
            new_json := to_jsonb(NEW);
          ELSE -- UPDATE
            old_json := to_jsonb(OLD);
            new_json := to_jsonb(NEW);

            -- Determine which fields changed
            SELECT array_agg(key)
            INTO changed_fields
            FROM jsonb_each(new_json)
            WHERE new_json->key IS DISTINCT FROM old_json->key;
          END IF;

          -- Get record ID (handle tables with and without id field)
          -- For entity_contexts table, use entity_id as the identifier
          IF TG_TABLE_NAME = 'entity_contexts' THEN
            rec_id := COALESCE(NEW.entity_id, OLD.entity_id);
          ELSE
            -- For all other tables, use the id field
            IF TG_OP = 'DELETE' THEN
              rec_id := OLD.id;
            ELSE
              rec_id := NEW.id;
            END IF;
          END IF;

          -- Insert audit log entry
          INSERT INTO audit_log (
            operation,
            table_name,
            record_id,
            old_data,
            new_data,
            changed_fields,
            operation_type
          ) VALUES (
            TG_OP,
            TG_TABLE_NAME,
            rec_id,
            old_json,
            new_json,
            changed_fields,
            'ai_tool'  -- Default to AI tool, can be overridden by application
          );

          -- Return appropriate record
          IF TG_OP = 'DELETE' THEN
            RETURN OLD;
          ELSE
            RETURN NEW;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('[DB] Audit log trigger function updated');
    } else {
      console.log('[DB] Running audit log migration...');
      const { addAuditLog } = await import('./migrations/add-audit-log');
      await addAuditLog(window.pg_lite);
      console.log('[DB] Audit log migration completed');
    }
  },

  /**
   * Export all data from the database
   */
  async export_data() {
    const [memory_blocks, memory_entities, entity_relationships, conversation_sessions, conversation_messages, entity_mentions, memory_retrieval_logs] = await Promise.all([
      window.db.select().from(schema.memory_blocks),
      window.db.select().from(schema.memory_entities),
      window.db.select().from(schema.entity_relationships),
      window.db.select().from(schema.conversation_sessions),
      window.db.select().from(schema.conversation_messages),
      window.db.select().from(schema.entity_mentions),
      window.db.select().from(schema.memory_retrieval_logs),
    ]);

    return { memory_blocks, memory_entities, entity_relationships, conversation_sessions, conversation_messages, entity_mentions, memory_retrieval_logs };
  },

  /**
   * Import data into the database
   */
  async import_data(data: {
    memory_blocks?: typeof schema.memory_blocks.$inferSelect[];
    memory_entities?: typeof schema.memory_entities.$inferSelect[];
    entity_relationships?: typeof schema.entity_relationships.$inferSelect[];
    conversation_sessions?: typeof schema.conversation_sessions.$inferSelect[];
    conversation_messages?: typeof schema.conversation_messages.$inferSelect[];
    entity_mentions?: typeof schema.entity_mentions.$inferSelect[];
    memory_retrieval_logs?: typeof schema.memory_retrieval_logs.$inferSelect[];
  }) {
    if (data.memory_blocks && data.memory_blocks.length > 0) {
      await window.db.insert(schema.memory_blocks).values(data.memory_blocks).onConflictDoNothing();
    }
    if (data.memory_entities && data.memory_entities.length > 0) {
      await window.db.insert(schema.memory_entities).values(data.memory_entities).onConflictDoNothing();
    }
    if (data.conversation_sessions && data.conversation_sessions.length > 0) {
      await window.db.insert(schema.conversation_sessions).values(data.conversation_sessions).onConflictDoNothing();
    }
    if (data.conversation_messages && data.conversation_messages.length > 0) {
      await window.db.insert(schema.conversation_messages).values(data.conversation_messages).onConflictDoNothing();
    }
    if (data.entity_relationships && data.entity_relationships.length > 0) {
      await window.db.insert(schema.entity_relationships).values(data.entity_relationships).onConflictDoNothing();
    }
    if (data.entity_mentions && data.entity_mentions.length > 0) {
      await window.db.insert(schema.entity_mentions).values(data.entity_mentions).onConflictDoNothing();
    }
    if (data.memory_retrieval_logs && data.memory_retrieval_logs.length > 0) {
      await window.db.insert(schema.memory_retrieval_logs).values(data.memory_retrieval_logs).onConflictDoNothing();
    }
  },

  /**
   * Get database size and stats
   */
  async get_stats() {
    const [memory_blocks_count, memory_entities_count, entity_relationships_count, conversation_sessions_count, conversation_messages_count, entity_mentions_count, memory_retrieval_logs_count] = await Promise.all([
      window.db.select().from(schema.memory_blocks).then(r => r.length),
      window.db.select().from(schema.memory_entities).then(r => r.length),
      window.db.select().from(schema.entity_relationships).then(r => r.length),
      window.db.select().from(schema.conversation_sessions).then(r => r.length),
      window.db.select().from(schema.conversation_messages).then(r => r.length),
      window.db.select().from(schema.entity_mentions).then(r => r.length),
      window.db.select().from(schema.memory_retrieval_logs).then(r => r.length),
    ]);

    return {
      memory_blocks: memory_blocks_count,
      memory_entities: memory_entities_count,
      entity_relationships: entity_relationships_count,
      conversation_sessions: conversation_sessions_count,
      conversation_messages: conversation_messages_count,
      entity_mentions: entity_mentions_count,
      memory_retrieval_logs: memory_retrieval_logs_count,
      total: memory_blocks_count + memory_entities_count + entity_relationships_count + conversation_sessions_count + conversation_messages_count + entity_mentions_count + memory_retrieval_logs_count,
    };
  },
};

/**
 * Initialize the database on module load
 * Uses window flag to prevent re-initialization in HMR dev mode
 */
let dbReadyPromise: Promise<void> | null = null;

if (!window.__db_initialized) {
  window.__db_initialized = true;
  dbReadyPromise = (async () => {
    await window.pg_lite.waitReady;
    await db_utils.migrate();
    console.log('[DB] PGlite initialized with IndexedDB persistence');
  })();
} else {
  // Already initialized, resolve immediately
  dbReadyPromise = Promise.resolve();
}

/**
 * Wait for database to be ready (migrations complete)
 */
export const waitForDb = () => dbReadyPromise!;

// Type augmentation for Window interface
declare global {
  interface Window {
    db: ReturnType<typeof drizzle<typeof schema>>;
    pg_lite: PGlite;
    __db_initialized?: boolean;
  }
}
