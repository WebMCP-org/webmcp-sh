import { eq, desc, and, gte } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertEntityContext } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all entity-context associations */
export const getAllEntityContextsQuery = () => {
  return db
    .select({
      entity_id: schema.entity_contexts.entity_id,
      context_id: schema.entity_contexts.context_id,
      relevance_score: schema.entity_contexts.relevance_score,
      created_at: schema.entity_contexts.created_at,
      entity: schema.memory_entities,
      context: schema.memory_contexts,
    })
    .from(schema.entity_contexts)
    .leftJoin(schema.memory_entities, eq(schema.entity_contexts.entity_id, schema.memory_entities.id))
    .leftJoin(schema.memory_contexts, eq(schema.entity_contexts.context_id, schema.memory_contexts.id))
    .orderBy(desc(schema.entity_contexts.relevance_score));
};

export const getAllEntityContextsQuerySQL = () => getAllEntityContextsQuery().toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all entity-context associations with optional filters */
export async function get_all(options?: { min_relevance?: number }) {
  const { min_relevance = 0 } = options ?? {};

  const baseQuery = db
    .select({
      entity_id: schema.entity_contexts.entity_id,
      context_id: schema.entity_contexts.context_id,
      relevance_score: schema.entity_contexts.relevance_score,
      created_at: schema.entity_contexts.created_at,
      entity: schema.memory_entities,
      context: schema.memory_contexts,
    })
    .from(schema.entity_contexts)
    .leftJoin(schema.memory_entities, eq(schema.entity_contexts.entity_id, schema.memory_entities.id))
    .leftJoin(schema.memory_contexts, eq(schema.entity_contexts.context_id, schema.memory_contexts.id));

  if (min_relevance > 0) {
    return baseQuery
      .where(gte(schema.entity_contexts.relevance_score, min_relevance))
      .orderBy(desc(schema.entity_contexts.relevance_score));
  }

  return baseQuery.orderBy(desc(schema.entity_contexts.relevance_score));
}

/** Get contexts for a specific entity */
export async function get_by_entity_id(entity_id: string) {
  return db
    .select({
      entity_id: schema.entity_contexts.entity_id,
      context_id: schema.entity_contexts.context_id,
      relevance_score: schema.entity_contexts.relevance_score,
      created_at: schema.entity_contexts.created_at,
      context: schema.memory_contexts,
    })
    .from(schema.entity_contexts)
    .leftJoin(schema.memory_contexts, eq(schema.entity_contexts.context_id, schema.memory_contexts.id))
    .where(eq(schema.entity_contexts.entity_id, entity_id))
    .orderBy(desc(schema.entity_contexts.relevance_score));
}

/** Get entities for a specific context */
export async function get_by_context_id(context_id: string) {
  return db
    .select({
      entity_id: schema.entity_contexts.entity_id,
      context_id: schema.entity_contexts.context_id,
      relevance_score: schema.entity_contexts.relevance_score,
      created_at: schema.entity_contexts.created_at,
      entity: schema.memory_entities,
    })
    .from(schema.entity_contexts)
    .leftJoin(schema.memory_entities, eq(schema.entity_contexts.entity_id, schema.memory_entities.id))
    .where(eq(schema.entity_contexts.context_id, context_id))
    .orderBy(desc(schema.entity_contexts.relevance_score));
}

/** Get specific entity-context association */
export async function get_by_ids(entity_id: string, context_id: string) {
  const [association] = await db
    .select()
    .from(schema.entity_contexts)
    .where(
      and(
        eq(schema.entity_contexts.entity_id, entity_id),
        eq(schema.entity_contexts.context_id, context_id)
      )
    );
  return association ?? null;
}

/** Create or update entity-context association */
export async function upsert(data: InsertEntityContext) {
  const validated = schema.insert_entity_context_schema.parse(data);

  const existing = await get_by_ids(validated.entity_id, validated.context_id);

  if (existing) {
    // Update relevance score
    const [updated] = await db
      .update(schema.entity_contexts)
      .set({ relevance_score: validated.relevance_score })
      .where(
        and(
          eq(schema.entity_contexts.entity_id, validated.entity_id),
          eq(schema.entity_contexts.context_id, validated.context_id)
        )
      )
      .returning();
    return updated;
  } else {
    // Create new association
    const [created] = await db
      .insert(schema.entity_contexts)
      .values(validated)
      .returning();
    return created;
  }
}

/** Remove entity-context association */
export async function remove(entity_id: string, context_id: string) {
  await db
    .delete(schema.entity_contexts)
    .where(
      and(
        eq(schema.entity_contexts.entity_id, entity_id),
        eq(schema.entity_contexts.context_id, context_id)
      )
    );
}

/** Remove all associations for an entity */
export async function remove_by_entity_id(entity_id: string) {
  await db
    .delete(schema.entity_contexts)
    .where(eq(schema.entity_contexts.entity_id, entity_id));
}

/** Remove all associations for a context */
export async function remove_by_context_id(context_id: string) {
  await db
    .delete(schema.entity_contexts)
    .where(eq(schema.entity_contexts.context_id, context_id));
}

/** Update relevance score */
export async function update_relevance(entity_id: string, context_id: string, relevance_score: number) {
  const [updated] = await db
    .update(schema.entity_contexts)
    .set({ relevance_score })
    .where(
      and(
        eq(schema.entity_contexts.entity_id, entity_id),
        eq(schema.entity_contexts.context_id, context_id)
      )
    )
    .returning();
  return updated ?? null;
}