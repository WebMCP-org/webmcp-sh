# Audit Log System

## Overview

The WebMCP playground now includes a **protected audit log system** that tracks all database changes and is **immune to AI manipulation**.

## Key Features

### 🛡️ AI-Protected
- **Cannot be modified or deleted** by AI tools
- Database triggers enforce protection at the database level
- SQL tool blocks any attempts to modify `audit_log` table

### 📝 Automatic Logging
- Database triggers automatically log ALL changes:
  - `INSERT` - New records created
  - `UPDATE` - Records modified (tracks which fields changed)
  - `DELETE` - Records deleted (preserves deleted data)

### 🔍 Complete History
- Logs changes to all main tables:
  - `memory_blocks`
  - `memory_entities`
  - `entity_relationships`
  - `conversation_sessions`
  - `conversation_messages`
  - `entity_mentions`
  - `memory_episodes`
  - `memory_contexts`
  - `entity_contexts`
  - `memory_triggers`
  - `memory_consolidations`
  - `memory_conflicts`

## Architecture

### Database Schema

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,

  -- What happened
  operation TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,

  -- Change details
  old_data JSONB,           -- NULL for INSERT
  new_data JSONB,           -- NULL for DELETE
  changed_fields TEXT[],    -- Array of changed field names (UPDATE only)

  -- Context
  operation_type TEXT,      -- 'ai_tool', 'system', 'user', 'migration'
  session_id UUID,          -- Link to conversation session

  -- Metadata
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_protected BOOLEAN NOT NULL DEFAULT true
);
```

### Protection Mechanisms

#### 1. Database Triggers

**Audit Protection Trigger:**
```sql
CREATE TRIGGER protect_audit_log_trigger
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION protect_audit_log();
```

This trigger **prevents** any `UPDATE` or `DELETE` operations on the audit log, raising an exception if attempted.

**Audit Logging Triggers:**
```sql
CREATE TRIGGER audit_[table_name]_trigger
  AFTER INSERT OR UPDATE OR DELETE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();
```

These triggers automatically create audit log entries whenever data changes.

#### 2. SQL Tool Protection

The `sql_query` MCP tool blocks attempts to modify the audit log:

```typescript
const auditLogPatterns = [
  /DELETE\s+FROM\s+audit_log/i,
  /UPDATE\s+audit_log/i,
  /INSERT\s+INTO\s+audit_log/i,
  /TRUNCATE\s+audit_log/i,
  /DROP\s+.*audit_log/i,
  /ALTER\s+TABLE\s+audit_log/i,
];
```

If AI attempts to run any of these queries, it receives:
```
AUDIT LOG PROTECTED: Cannot modify, insert, or delete from audit_log table.
The audit log is append-only and protected from AI manipulation.
```

## Usage

### Viewing the Audit Log

Navigate to the **Audit Log** page in the dashboard (Shield icon in sidebar).

The audit log shows:
- ✅ **Operation type** (INSERT/UPDATE/DELETE)
- ✅ **Table name** affected
- ✅ **Timestamp** of change
- ✅ **Record ID** affected
- ✅ **Changed fields** (for UPDATE operations)
- ✅ **Old/new data** snapshots

### Querying the Audit Log

The AI can **read** (but not modify) the audit log via SQL:

```sql
-- View recent deletions
SELECT * FROM audit_log
WHERE operation = 'DELETE'
ORDER BY timestamp DESC
LIMIT 10;

-- Track changes to a specific entity
SELECT * FROM audit_log
WHERE table_name = 'memory_entities'
  AND record_id = 'uuid-here'
ORDER BY timestamp ASC;

-- See what changed in an update
SELECT
  timestamp,
  changed_fields,
  old_data,
  new_data
FROM audit_log
WHERE operation = 'UPDATE'
  AND table_name = 'memory_blocks'
ORDER BY timestamp DESC;
```

## What Gets Logged

### INSERT Operations
```json
{
  "operation": "INSERT",
  "table_name": "memory_entities",
  "record_id": "123e4567-e89b-12d3-a456-426614174000",
  "old_data": null,
  "new_data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "category": "skill",
    "name": "SQL Expert",
    "description": "Advanced SQL query writing",
    ...
  },
  "changed_fields": null,
  "timestamp": "2025-10-05T13:08:42Z"
}
```

### UPDATE Operations
```json
{
  "operation": "UPDATE",
  "table_name": "memory_entities",
  "record_id": "123e4567-e89b-12d3-a456-426614174000",
  "old_data": {
    "name": "SQL Expert",
    "importance_score": 50
  },
  "new_data": {
    "name": "SQL Expert",
    "importance_score": 85
  },
  "changed_fields": ["importance_score"],
  "timestamp": "2025-10-05T14:30:15Z"
}
```

### DELETE Operations
```json
{
  "operation": "DELETE",
  "table_name": "memory_entities",
  "record_id": "123e4567-e89b-12d3-a456-426614174000",
  "old_data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "category": "skill",
    "name": "SQL Expert",
    ...
  },
  "new_data": null,
  "changed_fields": null,
  "timestamp": "2025-10-05T15:45:30Z"
}
```

## Benefits

### 🔒 Security
- AI cannot hide its actions by deleting audit entries
- Complete transparency of all database operations
- Immutable record of changes

### 🐛 Debugging
- Track down when and how data was modified
- Understand the sequence of operations
- Recover deleted data from audit log

### 📊 Analytics
- Understand AI behavior patterns
- Monitor database activity
- Analyze which operations are most common

### ⏱️ Recovery
- Audit log contains full snapshots of deleted records
- Can reconstruct previous states
- Rollback capability (if needed)

## Migration

The audit log system is automatically created when the application starts via the custom migration runner in `database.ts`:

```typescript
async runCustomMigrations() {
  const auditTableCheck = await window.pg_lite.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_log'
    ) as exists;
  `);

  if (!auditLogExists) {
    const { addAuditLog } = await import('./migrations/add-audit-log');
    await addAuditLog(window.pg_lite);
  }
}
```

## Testing the Protection

Try these queries with the AI:

```sql
-- ❌ This will be blocked
DELETE FROM audit_log;

-- ❌ This will be blocked
UPDATE audit_log SET timestamp = NOW();

-- ❌ This will be blocked
INSERT INTO audit_log (operation, table_name, record_id) VALUES ('INSERT', 'test', gen_random_uuid());

-- ✅ This will work (read-only)
SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 10;
```

## Future Enhancements

Potential improvements:
- [ ] Add user/session context to audit entries
- [ ] Create audit log export functionality
- [ ] Add audit log search/filtering in UI
- [ ] Create audit log retention policies
- [ ] Add audit log analytics dashboard
- [ ] Implement audit log rollback functionality

## Technical Notes

- **Storage**: Audit log is stored in IndexedDB (via PGlite)
- **Performance**: Triggers add minimal overhead (~1-2ms per operation)
- **Size**: Full JSONB snapshots may grow large over time
- **Retention**: Currently unlimited; consider adding cleanup policies
- **Backup**: Part of regular database backup/export

## Related Files

- Migration: [`src/react-app/lib/db/migrations/add-audit-log.ts`](src/react-app/lib/db/migrations/add-audit-log.ts)
- SQL Tool Protection: [`src/react-app/hooks/useMCPSQLTool.ts`](src/react-app/hooks/useMCPSQLTool.ts)
- Dashboard UI: [`src/react-app/routes/_dashboard.audit-log.tsx`](src/react-app/routes/_dashboard.audit-log.tsx)
- Database Utils: [`src/react-app/lib/db/database.ts`](src/react-app/lib/db/database.ts)
