import { eq, isNull } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryContext, UpdateMemoryContext } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all memory contexts */
export const getAllMemoryContextsQuery = () => {
  return db
    .select()
    .from(schema.memory_contexts)
    .orderBy(schema.memory_contexts.name);
};

export const getAllMemoryContextsQuerySQL = () => getAllMemoryContextsQuery().toSQL();

/** Get active memory contexts */
export const getActiveMemoryContextsQuery = () => {
  return db
    .select()
    .from(schema.memory_contexts)
    .where(eq(schema.memory_contexts.active, true))
    .orderBy(schema.memory_contexts.name);
};

export const getActiveMemoryContextsQuerySQL = () => getActiveMemoryContextsQuery().toSQL();

/** Get root contexts (no parent) */
export const getRootContextsQuery = () => {
  return db
    .select()
    .from(schema.memory_contexts)
    .where(isNull(schema.memory_contexts.parent_context_id))
    .orderBy(schema.memory_contexts.name);
};

export const getRootContextsQuerySQL = () => getRootContextsQuery().toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all contexts */
export async function get_all(options?: { active_only?: boolean }) {
  const { active_only = false } = options ?? {};

  const baseQuery = db.select().from(schema.memory_contexts);

  if (active_only) {
    return baseQuery.where(eq(schema.memory_contexts.active, true)).orderBy(schema.memory_contexts.name);
  }

  return baseQuery.orderBy(schema.memory_contexts.name);
}

/** Get context by ID */
export async function get_by_id(id: string) {
  const [context] = await db
    .select()
    .from(schema.memory_contexts)
    .where(eq(schema.memory_contexts.id, id));
  return context ?? null;
}

/** Get context by name */
export async function get_by_name(name: string) {
  const [context] = await db
    .select()
    .from(schema.memory_contexts)
    .where(eq(schema.memory_contexts.name, name));
  return context ?? null;
}

/** Create a new context */
export async function create(data: InsertMemoryContext) {
  const validated = schema.insert_memory_context_schema.parse(data);
  const [context] = await db.insert(schema.memory_contexts).values(validated).returning();
  return context;
}

/** Update a context */
export async function update(data: UpdateMemoryContext) {
  const validated = schema.update_memory_context_schema.parse(data);
  const { id, ...updates } = validated;
  const [context] = await db
    .update(schema.memory_contexts)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(schema.memory_contexts.id, id as string))
    .returning();
  return context ?? null;
}

/** Delete a context */
export async function remove(id: string) {
  await db.delete(schema.memory_contexts).where(eq(schema.memory_contexts.id, id));
}

/** Get child contexts */
export async function get_children(parent_id: string) {
  return db
    .select()
    .from(schema.memory_contexts)
    .where(eq(schema.memory_contexts.parent_context_id, parent_id))
    .orderBy(schema.memory_contexts.name);
}

/** Get root contexts (no parent) */
export async function get_roots() {
  return db
    .select()
    .from(schema.memory_contexts)
    .where(isNull(schema.memory_contexts.parent_context_id))
    .orderBy(schema.memory_contexts.name);
}

/** Toggle context active state */
export async function toggle_active(id: string) {
  const context = await get_by_id(id);
  if (!context) return null;

  const [updated] = await db
    .update(schema.memory_contexts)
    .set({ active: !context.active, updated_at: new Date() })
    .where(eq(schema.memory_contexts.id, id))
    .returning();

  return updated;
}

/** Get context hierarchy (recursive) */
export async function get_hierarchy(): Promise<any[]> {
  const roots = await get_roots();
  const result = [];

  for (const root of roots) {
    const children = await get_children(root.id);
    result.push({
      ...root,
      children: children
    });
  }

  return result;
}