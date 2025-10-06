import { eq, desc, and, or, sql } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryConflict, UpdateMemoryConflict, ConflictType, ResolutionStatus } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all memory conflicts */
export const getAllMemoryConflictsQuery = () => {
  return db
    .select()
    .from(schema.memory_conflicts)
    .orderBy(desc(schema.memory_conflicts.detected_at));
};

export const getAllMemoryConflictsQuerySQL = () => getAllMemoryConflictsQuery().toSQL();

/** Get pending conflicts */
export const getPendingConflictsQuery = () => {
  return db
    .select()
    .from(schema.memory_conflicts)
    .where(eq(schema.memory_conflicts.resolution_status, 'pending'))
    .orderBy(desc(schema.memory_conflicts.detected_at));
};

export const getPendingConflictsQuerySQL = () => getPendingConflictsQuery().toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all conflicts with optional filters */
export async function get_all(options?: {
  conflict_type?: ConflictType;
  resolution_status?: ResolutionStatus;
  limit?: number;
}) {
  const { conflict_type, resolution_status, limit = 100 } = options ?? {};

  const baseQuery = db.select().from(schema.memory_conflicts);

  const conditions = [];
  if (conflict_type) {
    conditions.push(eq(schema.memory_conflicts.conflict_type, conflict_type));
  }
  if (resolution_status) {
    conditions.push(eq(schema.memory_conflicts.resolution_status, resolution_status));
  }

  if (conditions.length > 0) {
    return baseQuery
      .where(and(...conditions))
      .orderBy(desc(schema.memory_conflicts.detected_at))
      .limit(limit);
  }

  return baseQuery.orderBy(desc(schema.memory_conflicts.detected_at)).limit(limit);
}

/** Get conflict by ID */
export async function get_by_id(id: string) {
  const [conflict] = await db
    .select()
    .from(schema.memory_conflicts)
    .where(eq(schema.memory_conflicts.id, id));
  return conflict ?? null;
}

/** Get conflicts involving an entity */
export async function get_by_entity_id(entity_id: string) {
  return db
    .select()
    .from(schema.memory_conflicts)
    .where(
      or(
        eq(schema.memory_conflicts.entity_a_id, entity_id),
        eq(schema.memory_conflicts.entity_b_id, entity_id)
      )
    )
    .orderBy(desc(schema.memory_conflicts.detected_at));
}

/** Get pending conflicts */
export async function get_pending() {
  return db
    .select()
    .from(schema.memory_conflicts)
    .where(eq(schema.memory_conflicts.resolution_status, 'pending'))
    .orderBy(desc(schema.memory_conflicts.detected_at));
}

/** Create a new conflict */
export async function create(data: InsertMemoryConflict) {
  const validated = schema.insert_memory_conflict_schema.parse(data);
  const [conflict] = await db.insert(schema.memory_conflicts).values(validated).returning();
  return conflict;
}

/** Update a conflict */
export async function update(data: UpdateMemoryConflict) {
  const validated = schema.update_memory_conflict_schema.parse(data);
  const { id, ...updates } = validated;
  const [conflict] = await db
    .update(schema.memory_conflicts)
    .set({
      ...updates,
      resolved_at: updates.resolved_at ? new Date(updates.resolved_at as any) : null
    })
    .where(eq(schema.memory_conflicts.id, id as string))
    .returning();
  return conflict ?? null;
}

/** Delete a conflict */
export async function remove(id: string) {
  await db.delete(schema.memory_conflicts).where(eq(schema.memory_conflicts.id, id));
}

/** Resolve a conflict */
export async function resolve(
  id: string,
  resolution_entity_id: string | null,
  resolution_strategy: string,
  resolution_status: ResolutionStatus = 'resolved'
) {
  const [resolved] = await db
    .update(schema.memory_conflicts)
    .set({
      resolution_status,
      resolution_entity_id,
      resolution_strategy,
      resolved_at: new Date(),
    })
    .where(eq(schema.memory_conflicts.id, id))
    .returning();
  return resolved ?? null;
}

/** Mark conflict as both valid (no resolution needed) */
export async function mark_both_valid(id: string) {
  return resolve(id, null, 'both_valid', 'both_valid');
}

/** Ignore a conflict */
export async function ignore(id: string) {
  return resolve(id, null, 'ignored', 'ignored');
}

/** Get conflict statistics */
export async function get_stats() {
  const result = await db
    .select({
      conflict_type: schema.memory_conflicts.conflict_type,
      resolution_status: schema.memory_conflicts.resolution_status,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.memory_conflicts)
    .groupBy(schema.memory_conflicts.conflict_type, schema.memory_conflicts.resolution_status);

  return result;
}

/** Detect conflict between two entities */
export async function detect_conflict(
  entity_a_id: string,
  entity_b_id: string,
  conflict_type: ConflictType
) {
  // Check if conflict already exists
  const existing = await db
    .select()
    .from(schema.memory_conflicts)
    .where(
      and(
        or(
          and(
            eq(schema.memory_conflicts.entity_a_id, entity_a_id),
            eq(schema.memory_conflicts.entity_b_id, entity_b_id)
          ),
          and(
            eq(schema.memory_conflicts.entity_a_id, entity_b_id),
            eq(schema.memory_conflicts.entity_b_id, entity_a_id)
          )
        ),
        eq(schema.memory_conflicts.conflict_type, conflict_type)
      )
    );

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conflict
  return create({
    entity_a_id,
    entity_b_id,
    conflict_type,
    resolution_status: 'pending',
  });
}