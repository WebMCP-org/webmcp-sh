import { eq, desc, and, gte } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryTrigger, UpdateMemoryTrigger, TriggerType } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all memory triggers */
export const getAllMemoryTriggersQuery = () => {
  return db
    .select()
    .from(schema.memory_triggers)
    .orderBy(desc(schema.memory_triggers.strength));
};

export const getAllMemoryTriggersQuerySQL = () => getAllMemoryTriggersQuery().toSQL();

/** Get triggers by entity */
export const getMemoryTriggersByEntityQuery = (entity_id: string) => {
  return db
    .select()
    .from(schema.memory_triggers)
    .where(eq(schema.memory_triggers.entity_id, entity_id))
    .orderBy(desc(schema.memory_triggers.strength));
};

export const getMemoryTriggersByEntityQuerySQL = (entity_id: string) =>
  getMemoryTriggersByEntityQuery(entity_id).toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all triggers with optional filters */
export async function get_all(options?: { trigger_type?: TriggerType; min_strength?: number }) {
  const { trigger_type, min_strength = 0 } = options ?? {};

  const baseQuery = db.select().from(schema.memory_triggers);

  const conditions = [];
  if (trigger_type) {
    conditions.push(eq(schema.memory_triggers.trigger_type, trigger_type));
  }
  if (min_strength > 0) {
    conditions.push(gte(schema.memory_triggers.strength, min_strength));
  }

  if (conditions.length > 0) {
    return baseQuery.where(and(...conditions)).orderBy(desc(schema.memory_triggers.strength));
  }

  return baseQuery.orderBy(desc(schema.memory_triggers.strength));
}

/** Get triggers by entity ID */
export async function get_by_entity_id(entity_id: string) {
  return db
    .select()
    .from(schema.memory_triggers)
    .where(eq(schema.memory_triggers.entity_id, entity_id))
    .orderBy(desc(schema.memory_triggers.strength));
}

/** Get trigger by ID */
export async function get_by_id(id: string) {
  const [trigger] = await db
    .select()
    .from(schema.memory_triggers)
    .where(eq(schema.memory_triggers.id, id));
  return trigger ?? null;
}

/** Get triggers by type */
export async function get_by_type(trigger_type: TriggerType) {
  return db
    .select()
    .from(schema.memory_triggers)
    .where(eq(schema.memory_triggers.trigger_type, trigger_type))
    .orderBy(desc(schema.memory_triggers.strength));
}

/** Get triggers by value (exact match) */
export async function get_by_value(trigger_value: string) {
  return db
    .select()
    .from(schema.memory_triggers)
    .where(eq(schema.memory_triggers.trigger_value, trigger_value))
    .orderBy(desc(schema.memory_triggers.strength));
}

/** Create a new trigger */
export async function create(data: InsertMemoryTrigger) {
  const validated = schema.insert_memory_trigger_schema.parse(data);
  const [trigger] = await db.insert(schema.memory_triggers).values(validated).returning();
  return trigger;
}

/** Update a trigger */
export async function update(data: UpdateMemoryTrigger) {
  const validated = schema.update_memory_trigger_schema.parse(data);
  const { id, ...updates } = validated;
  const [trigger] = await db
    .update(schema.memory_triggers)
    .set(updates)
    .where(eq(schema.memory_triggers.id, id as string))
    .returning();
  return trigger ?? null;
}

/** Delete a trigger */
export async function remove(id: string) {
  await db.delete(schema.memory_triggers).where(eq(schema.memory_triggers.id, id));
}

/** Remove all triggers for an entity */
export async function remove_by_entity_id(entity_id: string) {
  await db
    .delete(schema.memory_triggers)
    .where(eq(schema.memory_triggers.entity_id, entity_id));
}

/** Update trigger strength */
export async function update_strength(id: string, strength: number) {
  const [updated] = await db
    .update(schema.memory_triggers)
    .set({ strength })
    .where(eq(schema.memory_triggers.id, id))
    .returning();
  return updated ?? null;
}

/** Find entities triggered by a value */
export async function find_triggered_entities(trigger_value: string, trigger_type?: TriggerType) {
  const baseQuery = db
    .select({
      trigger: schema.memory_triggers,
      entity: schema.memory_entities,
    })
    .from(schema.memory_triggers)
    .leftJoin(schema.memory_entities, eq(schema.memory_triggers.entity_id, schema.memory_entities.id));

  if (trigger_type) {
    return baseQuery
      .where(
        and(
          eq(schema.memory_triggers.trigger_value, trigger_value),
          eq(schema.memory_triggers.trigger_type, trigger_type)
        )
      )
      .orderBy(desc(schema.memory_triggers.strength));
  }

  return baseQuery
    .where(eq(schema.memory_triggers.trigger_value, trigger_value))
    .orderBy(desc(schema.memory_triggers.strength));
}