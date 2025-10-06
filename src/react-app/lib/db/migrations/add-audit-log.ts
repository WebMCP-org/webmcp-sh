import { PGlite } from '@electric-sql/pglite';

/**
 * AUDIT LOG SYSTEM - Protected from AI manipulation
 *
 * This migration creates:
 * 1. audit_log table - append-only log of all database changes
 * 2. Database triggers on all main tables to automatically log changes
 * 3. Protection mechanisms to prevent AI from deleting/modifying audit logs
 */
export async function addAuditLog(db: PGlite) {
  console.log('[Migration] Adding audit log system...');

  // 1. Create the audit_log table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      -- What happened
      operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
      table_name TEXT NOT NULL,
      record_id UUID NOT NULL,

      -- Change details
      old_data JSONB,  -- NULL for INSERT
      new_data JSONB,  -- NULL for DELETE
      changed_fields TEXT[],  -- Array of field names that changed (UPDATE only)

      -- Context
      operation_type TEXT,  -- 'ai_tool', 'system', 'user', 'migration'
      session_id UUID,  -- Link to conversation session if applicable

      -- Metadata
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- Prevent modifications (enforced by triggers below)
      is_protected BOOLEAN NOT NULL DEFAULT true
    );

    -- Indexes for efficient querying
    CREATE INDEX IF NOT EXISTS audit_log_timestamp_idx ON audit_log(timestamp DESC);
    CREATE INDEX IF NOT EXISTS audit_log_table_idx ON audit_log(table_name);
    CREATE INDEX IF NOT EXISTS audit_log_record_idx ON audit_log(record_id);
    CREATE INDEX IF NOT EXISTS audit_log_operation_idx ON audit_log(operation);
    CREATE INDEX IF NOT EXISTS audit_log_session_idx ON audit_log(session_id);
  `);

  // 2. Create trigger function to prevent modifications/deletions of audit log
  await db.exec(`
    CREATE OR REPLACE FUNCTION protect_audit_log()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Audit log entries cannot be deleted. Table: audit_log';
      END IF;

      IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Audit log entries cannot be modified. Table: audit_log';
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS protect_audit_log_trigger ON audit_log;
    CREATE TRIGGER protect_audit_log_trigger
      BEFORE UPDATE OR DELETE ON audit_log
      FOR EACH ROW
      EXECUTE FUNCTION protect_audit_log();
  `);

  // 3. Create generic audit trigger function
  await db.exec(`
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

  // 4. Create triggers on all main tables
  const tables = [
    'memory_blocks',
    'memory_entities',
    'entity_relationships',
    'conversation_sessions',
    'conversation_messages',
    'entity_mentions',
    'memory_episodes',
    'memory_contexts',
    'entity_contexts',
    'memory_triggers',
    'memory_consolidations',
    'memory_conflicts',
  ];

  for (const table of tables) {
    await db.exec(`
      DROP TRIGGER IF EXISTS audit_${table}_trigger ON ${table};
      CREATE TRIGGER audit_${table}_trigger
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION audit_trigger_function();
    `);
  }

  console.log('[Migration] ✅ Audit log system created with triggers on all tables');
  console.log('[Migration] ✅ Audit log is protected from modifications and deletions');
}
