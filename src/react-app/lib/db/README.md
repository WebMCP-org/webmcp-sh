# Database Layer - PGlite + Drizzle

This directory contains the complete database solution for the application using **PGlite** (Postgres in the browser) with **Drizzle ORM** and **Zod** validation.

## Overview

The database layer provides:
- **PGlite**: Full Postgres running in the browser via WASM
- **Drizzle ORM**: Type-safe SQL queries with excellent TypeScript support
- **Zod Validation**: Runtime validation for all database operations
- **IndexedDB Persistence**: Data persists across browser sessions
- **Tab Guard**: Prevents multiple tabs from accessing the database simultaneously

## Architecture

### Files

- **`schema.ts`**: Drizzle table definitions + Zod validation schemas
- **`database.ts`**: PGlite instance, Drizzle setup, and database utilities
- **`tab-guard.ts`**: BroadcastChannel-based multi-tab prevention
- **`index.ts`**: Public API exports
- **`README.md`**: This file

### Configuration

- **Database Name**: `playground-webmcp-db`
- **Storage**: IndexedDB
- **Durability**: Relaxed (queries return immediately, flush happens async)
- **Thread**: Main thread (not in a worker)

## Usage

### Basic Queries

```typescript
import { db, users, tasks } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Insert a user
const new_user = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
}).returning();

// Query users
const all_users = await db.select().from(users);

// Query with conditions
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'john@example.com'));

// Update
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, user_id));

// Delete
await db.delete(users)
  .where(eq(users.id, user_id));
```

### Validation

All insert and update operations should validate data using Zod schemas:

```typescript
import { insert_user_schema, type InsertUser } from '@/lib/db';

// Validate before insert
const user_data: InsertUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

const validated = insert_user_schema.parse(user_data);

await db.insert(users).values(validated);
```

### Database Utilities

```typescript
import { db_utils } from '@/lib/db';

// Clear all data
await db_utils.clear_all();

// Reset database (drop and recreate tables)
await db_utils.reset();

// Export data
const data = await db_utils.export_data();
console.log(data);

// Import data
await db_utils.import_data({
  users: [...],
  tasks: [...],
});

// Get statistics
const stats = await db_utils.get_stats();
console.log(stats); // { users: 10, tasks: 50, ... }
```

### Tab Guard

The tab guard prevents multiple tabs from running simultaneously:

```typescript
import { tab_guard, get_tab_status } from '@/lib/db';

// Check if this is the primary tab
const is_primary = tab_guard.get_is_primary();

// Listen for changes
const unsubscribe = tab_guard.on_change((is_primary, has_other_tabs) => {
  if (!is_primary && has_other_tabs) {
    // Show warning: "App is open in another tab"
  }
});

// Get current status
const status = get_tab_status();
console.log(status); // { is_primary: true, has_other_tabs: false }
```

## Schema

### Tables

#### Users
- `id`: UUID (primary key)
- `name`: Text
- `email`: Text (unique)
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Tasks
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `title`: Text
- `description`: Text (nullable)
- `completed`: Boolean
- `priority`: Enum ('low', 'medium', 'high')
- `due_date`: Timestamp (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Notes
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `title`: Text
- `content`: Text
- `tags`: Text[]
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Posts
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users)
- `title`: Text
- `slug`: Text (unique)
- `content`: Text
- `excerpt`: Text (nullable)
- `cover_image`: Text (nullable)
- `published`: Boolean
- `published_at`: Timestamp (nullable)
- `tags`: Text[]
- `view_count`: Integer
- `like_count`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Comments
- `id`: UUID (primary key)
- `post_id`: UUID (foreign key → posts)
- `user_id`: UUID (foreign key → users)
- `content`: Text
- `parent_id`: UUID (nullable, self-reference for nested comments)
- `like_count`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Indexes

All tables have indexes on:
- Foreign keys (for faster joins)
- Commonly queried fields (e.g., `email`, `slug`, `completed`, `published`)
- Timestamp fields (for sorting)

## Migration from Dexie

The previous database layer used Dexie (IndexedDB wrapper). Key differences:

### Before (Dexie)
```typescript
// Query
const users = await db.users.toArray();
const user = await db.users.get(id);

// Insert
await db.users.add({ name: 'John', email: 'john@example.com' });

// Update
await db.users.update(id, { name: 'Jane' });

// Delete
await db.users.delete(id);
```

### After (PGlite + Drizzle)
```typescript
// Query
const users = await db.select().from(schema.users);
const user = await db.select().from(schema.users).where(eq(schema.users.id, id));

// Insert
await db.insert(schema.users).values({ name: 'John', email: 'john@example.com' });

// Update
await db.update(schema.users).set({ name: 'Jane' }).where(eq(schema.users.id, id));

// Delete
await db.delete(schema.users).where(eq(schema.users.id, id));
```

## Benefits Over Dexie

1. **Full SQL Support**: Complex queries, joins, aggregations, transactions
2. **Better Type Safety**: Drizzle provides excellent TypeScript inference
3. **Real Postgres**: Same database in development, testing, and production
4. **Relational Queries**: Proper foreign keys and cascading deletes
5. **Advanced Features**: CTEs, window functions, full-text search
6. **Migration Path**: Easy to migrate to server-side Postgres later

## Performance

- **Initial Load**: ~2.6MB gzipped WASM (cached after first load)
- **Query Speed**: Near-native Postgres performance
- **Persistence**: IndexedDB with relaxed durability for responsiveness
- **Memory**: Efficient memory usage with proper indexing

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Troubleshooting

### Database not initializing
Check the console for errors. The database auto-initializes on module load.

### Multiple tabs warning
The tab guard should prevent this. If you see issues, check `tab-guard.ts` configuration.

### Data not persisting
Ensure IndexedDB is enabled in your browser. Check browser storage settings.

### Performance issues
- Check if indexes are being used (use `EXPLAIN` queries)
- Consider adjusting `relaxedDurability` setting
- Monitor memory usage with large datasets

## AI Agent SQL Tools

AI agents have direct SQL access to the memory database through MCP tools with safety guardrails:

### Available Tools
- **`sql_query`** - Execute SELECT, INSERT, UPDATE, DELETE queries
- **`sql_schema`** - Inspect table structure and columns
- **`sql_tables`** - List all available tables

### Safety Features
✅ **Allowed**: SELECT, INSERT, UPDATE, DELETE
❌ **Blocked**: DROP, TRUNCATE, ALTER, CREATE, SQL injection patterns
⚠️ **Warned**: UPDATE without WHERE, DELETE without WHERE

See **[SQL Tools Guide](../../../docs/SQL_TOOLS_GUIDE.md)** for comprehensive documentation.

## Future Enhancements

- [x] Add live query support with `@electric-sql/pglite/live`
- [x] Add MCP SQL tools for AI agents
- [ ] Implement optimistic updates for better UX
- [ ] Add database migration tooling
- [ ] Create React hooks for common queries
- [ ] Add full-text search with Postgres FTS
- [ ] Implement data sync with remote server
