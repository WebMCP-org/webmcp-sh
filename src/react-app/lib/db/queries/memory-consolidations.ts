import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryConsolidation, ConsolidationType } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all consolidations */
export const getAllMemoryConsolidationsQuery = () => {
  return db
    .select()
    .from(schema.memory_consolidations)
    .orderBy(desc(schema.memory_consolidations.consolidated_at));
};

export const getAllMemoryConsolidationsQuerySQL = () => getAllMemoryConsolidationsQuery().toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all consolidations with optional filters */
export async function get_all(options?: { consolidation_type?: ConsolidationType; limit?: number }) {
  const { consolidation_type, limit = 100 } = options ?? {};

  const baseQuery = db.select().from(schema.memory_consolidations);

  if (consolidation_type) {
    return baseQuery
      .where(eq(schema.memory_consolidations.consolidation_type, consolidation_type))
      .orderBy(desc(schema.memory_consolidations.consolidated_at))
      .limit(limit);
  }

  return baseQuery.orderBy(desc(schema.memory_consolidations.consolidated_at)).limit(limit);
}

/** Get consolidation by ID */
export async function get_by_id(id: string) {
  const [consolidation] = await db
    .select()
    .from(schema.memory_consolidations)
    .where(eq(schema.memory_consolidations.id, id));
  return consolidation ?? null;
}

/** Get consolidations for a target entity */
export async function get_by_target_entity_id(entity_id: string) {
  return db
    .select()
    .from(schema.memory_consolidations)
    .where(eq(schema.memory_consolidations.target_entity_id, entity_id))
    .orderBy(desc(schema.memory_consolidations.consolidated_at));
}

/** Get consolidations that involved a source entity */
export async function get_by_source_entity_id(entity_id: string) {
  return db
    .select()
    .from(schema.memory_consolidations)
    .where(sql`${entity_id} = ANY(${schema.memory_consolidations.source_entity_ids})`)
    .orderBy(desc(schema.memory_consolidations.consolidated_at));
}

/** Create a new consolidation record */
export async function create(data: InsertMemoryConsolidation) {
  const validated = schema.insert_memory_consolidation_schema.parse(data);
  const [consolidation] = await db.insert(schema.memory_consolidations).values(validated).returning();
  return consolidation;
}

/** Delete a consolidation record */
export async function remove(id: string) {
  await db.delete(schema.memory_consolidations).where(eq(schema.memory_consolidations.id, id));
}

/** Get consolidations by type */
export async function get_by_type(consolidation_type: ConsolidationType, limit = 20) {
  return db
    .select()
    .from(schema.memory_consolidations)
    .where(eq(schema.memory_consolidations.consolidation_type, consolidation_type))
    .orderBy(desc(schema.memory_consolidations.consolidated_at))
    .limit(limit);
}

/** Get recent consolidations */
export async function get_recent(limit = 20) {
  return db
    .select()
    .from(schema.memory_consolidations)
    .orderBy(desc(schema.memory_consolidations.consolidated_at))
    .limit(limit);
}

/** Get consolidation statistics */
export async function get_stats() {
  const result = await db
    .select({
      consolidation_type: schema.memory_consolidations.consolidation_type,
      count: sql<number>`count(*)::int`,
      avg_confidence: sql<number>`avg(${schema.memory_consolidations.confidence})::float`,
    })
    .from(schema.memory_consolidations)
    .groupBy(schema.memory_consolidations.consolidation_type);

  return result;
}

/** Perform a merge consolidation */
export async function merge_entities(source_entity_ids: string[], target_entity_id: string, reason?: string) {
  return create({
    consolidation_type: 'merge',
    source_entity_ids,
    target_entity_id,
    reason: reason ?? 'Entities merged due to similarity',
    confidence: 80,
    consolidated_by: 'system',
  });
}

/** Perform a deduplication consolidation */
export async function deduplicate_entities(source_entity_ids: string[], target_entity_id: string, reason?: string) {
  return create({
    consolidation_type: 'deduplicate',
    source_entity_ids,
    target_entity_id,
    reason: reason ?? 'Duplicate entities removed',
    confidence: 90,
    consolidated_by: 'system',
  });
}