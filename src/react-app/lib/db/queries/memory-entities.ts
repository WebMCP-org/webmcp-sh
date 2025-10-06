import { eq, desc, and, or, sql, count } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryEntity, UpdateMemoryEntity, MemoryEntityCategory } from '../types';

// Note: token_cost is automatically calculated via PostgreSQL generated column
// No manual calculation needed in create/update operations

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/**
 * Get all memory entities ordered by importance
 */
export const getAllMemoryEntitiesQuery = () => {
  return db
    .select()
    .from(schema.memory_entities)
    .orderBy(
      desc(schema.memory_entities.importance_score),
      desc(schema.memory_entities.last_mentioned)
    );
};

export const getAllMemoryEntitiesQuerySQL = () => getAllMemoryEntitiesQuery().toSQL();

export type GetAllMemoryEntitiesResult = Awaited<ReturnType<typeof getAllMemoryEntitiesQuery>>[number];

/**
 * Get memory entity by ID
 */
export const getMemoryEntityByIdQuery = (id: string) => {
  return db
    .select()
    .from(schema.memory_entities)
    .where(eq(schema.memory_entities.id, id));
};

export const getMemoryEntityByIdQuerySQL = (id: string) => getMemoryEntityByIdQuery(id).toSQL();

export type GetMemoryEntityByIdResult = Awaited<ReturnType<typeof getMemoryEntityByIdQuery>>[number];

/**
 * Get category counts for memory entities
 */
export const getMemoryEntityCategoryCountsQuery = () => {
  return db
    .select({
      category: schema.memory_entities.category,
      count: count(),
    })
    .from(schema.memory_entities)
    .groupBy(schema.memory_entities.category);
};

export const getMemoryEntityCategoryCountsQuerySQL = () => getMemoryEntityCategoryCountsQuery().toSQL();

export type GetMemoryEntityCategoryCountsResult = Awaited<ReturnType<typeof getMemoryEntityCategoryCountsQuery>>[number];

/**
 * Get count of all memory entities
 */
export const getMemoryEntitiesCountQuery = () => {
  return db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.memory_entities);
};

export const getMemoryEntitiesCountQuerySQL = () => getMemoryEntitiesCountQuery().toSQL();

export type GetMemoryEntitiesCountResult = Awaited<ReturnType<typeof getMemoryEntitiesCountQuery>>[number];

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all entities with optional filters */
export async function get_all(options?: { category?: MemoryEntityCategory; limit?: number }) {
  const { category, limit = 100 } = options ?? {};

  if (category) {
    return db
      .select()
      .from(schema.memory_entities)
      .where(eq(schema.memory_entities.category, category))
      .orderBy(
        desc(schema.memory_entities.importance_score),
        desc(schema.memory_entities.last_mentioned)
      )
      .limit(limit);
  }

  return db
    .select()
    .from(schema.memory_entities)
    .orderBy(
      desc(schema.memory_entities.importance_score),
      desc(schema.memory_entities.last_mentioned)
    )
    .limit(limit);
}

/**
 * Get entity by ID
 */
export async function get_by_id(id: string) {
  const [entity] = await db
    .select()
    .from(schema.memory_entities)
    .where(eq(schema.memory_entities.id, id));
  return entity ?? null;
}

/** Create a new memory entity */
export async function create(data: InsertMemoryEntity) {
  const validated = schema.insert_memory_entity_schema.parse(data);
  const [entity] = await db.insert(schema.memory_entities).values(validated).returning();
  return entity;
}

/** Update a memory entity */
export async function update(data: UpdateMemoryEntity) {
  const validated = schema.update_memory_entity_schema.parse(data);
  const { id, ...updates } = validated;
  const [entity] = await db
    .update(schema.memory_entities)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(schema.memory_entities.id, id as string))
    .returning();
  return entity ?? null;
}

/**
 * Update a single field on a memory entity (for inline editing)
 * Bypasses schema validation for fields not in the insert schema
 */
export async function update_field(id: string, field: string, value: string | number | string[]) {
  // Whitelist of allowed fields for inline editing
  const allowedFields = [
    'category',
    'name',
    'description',
    'tags',
    'confidence',
    'importance_score',
    'memory_tier',
    'decay_rate',
    'promotion_score',
    'current_strength'
  ];

  if (!allowedFields.includes(field)) {
    throw new Error(`Field '${field}' is not allowed for inline editing`);
  }

  const updates: Record<string, any> = {
    [field]: value,
    updated_at: new Date()
  };

  const [entity] = await db
    .update(schema.memory_entities)
    .set(updates)
    .where(eq(schema.memory_entities.id, id))
    .returning();

  return entity ?? null;
}

/**
 * Delete a memory entity
 */
export async function remove(id: string) {
  await db.delete(schema.memory_entities).where(eq(schema.memory_entities.id, id));
}

/** Search entities by name or description */
export async function search(query: string, options?: { category?: MemoryEntityCategory }) {
  const { category } = options ?? {};
  const search_pattern = `%${query}%`;

  if (category) {
    return db
      .select()
      .from(schema.memory_entities)
      .where(
        and(
          or(
            sql`${schema.memory_entities.name} ILIKE ${search_pattern}`,
            sql`${schema.memory_entities.description} ILIKE ${search_pattern}`
          ),
          eq(schema.memory_entities.category, category)
        )
      )
      .orderBy(
        desc(schema.memory_entities.importance_score),
        desc(schema.memory_entities.last_mentioned)
      );
  }

  return db
    .select()
    .from(schema.memory_entities)
    .where(
      or(
        sql`${schema.memory_entities.name} ILIKE ${search_pattern}`,
        sql`${schema.memory_entities.description} ILIKE ${search_pattern}`
      )
    )
    .orderBy(
      desc(schema.memory_entities.importance_score),
      desc(schema.memory_entities.last_mentioned)
    );
}

/**
 * Get entities by tag
 */
export async function get_by_tag(tag: string) {
  return db
    .select()
    .from(schema.memory_entities)
    .where(sql`${tag} = ANY(${schema.memory_entities.tags})`)
    .orderBy(desc(schema.memory_entities.importance_score));
}

/** Get entities by category */
export async function get_by_category(category: MemoryEntityCategory) {
  return db
    .select()
    .from(schema.memory_entities)
    .where(eq(schema.memory_entities.category, category))
    .orderBy(desc(schema.memory_entities.importance_score));
}

/**
 * Increment mention count
 */
export async function increment_mention(id: string) {
  await db
    .update(schema.memory_entities)
    .set({
      mention_count: sql`${schema.memory_entities.mention_count} + 1`,
      last_mentioned: new Date(),
      updated_at: new Date(),
    })
    .where(eq(schema.memory_entities.id, id));
}

/**
 * Get most mentioned entities
 */
export async function get_top_mentioned(limit = 10) {
  return db
    .select()
    .from(schema.memory_entities)
    .orderBy(desc(schema.memory_entities.mention_count))
    .limit(limit);
}

/**
 * Get recently mentioned entities
 */
export async function get_recently_mentioned(limit = 10) {
  return db
    .select()
    .from(schema.memory_entities)
    .orderBy(desc(schema.memory_entities.last_mentioned))
    .limit(limit);
}

/**
 * Get token costs summed by category
 */
export const getMemoryEntityTokensByCategoryQuery = () => {
  return db
    .select({
      category: schema.memory_entities.category,
      total_tokens: sql<number>`COALESCE(SUM(${schema.memory_entities.token_cost}), 0)::int`.as('total_tokens'),
      count: count(),
    })
    .from(schema.memory_entities)
    .groupBy(schema.memory_entities.category);
};

export const getMemoryEntityTokensByCategoryQuerySQL = () => getMemoryEntityTokensByCategoryQuery().toSQL();

export type GetMemoryEntityTokensByCategoryResult = Awaited<ReturnType<typeof getMemoryEntityTokensByCategoryQuery>>[number];

/**
 * Get token costs summed by memory tier
 */
export const getMemoryEntityTokensByTierQuery = () => {
  return db
    .select({
      memory_tier: schema.memory_entities.memory_tier,
      total_tokens: sql<number>`COALESCE(SUM(${schema.memory_entities.token_cost}), 0)::int`.as('total_tokens'),
      count: count(),
    })
    .from(schema.memory_entities)
    .groupBy(schema.memory_entities.memory_tier);
};

export const getMemoryEntityTokensByTierQuerySQL = () => getMemoryEntityTokensByTierQuery().toSQL();

export type GetMemoryEntityTokensByTierResult = Awaited<ReturnType<typeof getMemoryEntityTokensByTierQuery>>[number];
