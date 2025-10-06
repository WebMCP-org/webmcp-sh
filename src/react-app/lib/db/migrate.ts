import { pg_lite, db } from './database';
import { sql } from 'drizzle-orm';

/**
 * Migration tracking table schema
 */
interface MigrationRecord {
  hash: string;
  created_at: Date;
}

/**
 * Ensure the migrations table exists
 * Note: CREATE TABLE requires raw SQL - Drizzle doesn't support DDL
 */
async function ensureMigrationsTable() {
  await pg_lite.exec(`
    CREATE TABLE IF NOT EXISTS drizzle_migrations (
      hash TEXT PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

/**
 * Get list of already executed migrations
 */
async function getMigratedHashes(): Promise<string[]> {
  // @ts-expect-error drizzle types
  const result = await db.execute<MigrationRecord>(sql`
    SELECT hash FROM drizzle_migrations ORDER BY created_at ASC
  `);
  return result.rows.map((row) => row.hash);
}

/**
 * Record a successful migration
 */
async function recordMigration(hash: string) {
  await db.execute(sql`
    INSERT INTO drizzle_migrations (hash, created_at)
    VALUES (${hash}, NOW())
    ON CONFLICT DO NOTHING
  `);
}

/**
 * Check if tables already exist in the database
 */
async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `);

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0]?.exists === true;
  } catch {
    return false;
  }
}

/**
 * Run pending migrations
 * Returns the number of migrations executed
 */
export async function runMigrations(): Promise<number> {
  console.log('[DB] Starting migration check...');

  // Ensure migrations table exists
  await ensureMigrationsTable();

  // Get already executed migrations
  const executedHashes = await getMigratedHashes();

  // Load migrations from JSON
  const migrationsModule = await import('./migrations.json');
  const migrations = migrationsModule.default;

  // Filter pending migrations
  const pendingMigrations = migrations.filter(
    (migration: { hash: string; sql: string[] }) => !executedHashes.includes(migration.hash)
  );

  if (pendingMigrations.length === 0) {
    console.log('[DB] No pending migrations found');
    return 0;
  }

  console.log(`[DB] Found ${pendingMigrations.length} pending migration(s)`);

  // Check if tables already exist (from old migration system)
  const tablesExist = await checkTablesExist();

  // Execute migrations in sequence
  for (const migration of pendingMigrations) {
    console.log(`[DB] Executing migration: ${migration.hash}`);
    try {
      if (tablesExist) {
        // Tables already exist from old migration system
        // Just record the migration as executed without running it
        console.log(`[DB] Tables already exist, marking migration as executed: ${migration.hash}`);
        await recordMigration(migration.hash);
      } else {
        // Execute each SQL statement in sequence
        if (Array.isArray(migration.sql)) {
          for (const statement of migration.sql) {
            await pg_lite.exec(statement);
          }
        }

        // Record successful migration
        await recordMigration(migration.hash);
        console.log(`[DB] Successfully completed migration: ${migration.hash}`);
      }
    } catch (error) {
      console.error(`[DB] Failed to execute migration ${migration.hash}:`, error);
      throw error;
    }
  }

  // Mark problematic audit_log migration as executed if it exists
  // This migration tried to create audit_log but we manage it separately with raw SQL
  const auditLogMigrationHash = '1bd74d5c580ad5b34b50b33c62ea7ea498c3bab301b13a67ca79b290f1d2206d';
  if (!executedHashes.includes(auditLogMigrationHash)) {
    console.log('[DB] Marking audit_log migration as executed (managed by custom migration)');
    await recordMigration(auditLogMigrationHash);
  }

  console.log(`[DB] All ${pendingMigrations.length} migration(s) completed successfully`);

  // Note: Token costs are now calculated automatically via PostgreSQL generated columns
  // No manual triggers or updates needed

  return pendingMigrations.length;
}

/**
 * Check if there are pending migrations
 */
export async function hasPendingMigrations(): Promise<boolean> {
  await ensureMigrationsTable();
  const executedHashes = await getMigratedHashes();
  const migrationsModule = await import('./migrations.json');
  const migrations = migrationsModule.default;

  const pendingMigrations = migrations.filter(
    (migration: { hash: string; sql: string[] }) => !executedHashes.includes(migration.hash)
  );

  return pendingMigrations.length > 0;
}
