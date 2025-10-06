import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';

// Note: token_cost is automatically calculated via PostgreSQL generated column
// No manual calculation needed in create/update operations

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/**
 * Get all memory blocks ordered by priority
 */
export const getAllMemoryBlocksQuery = () => {
  return db
    .select()
    .from(schema.memory_blocks)
    .orderBy(desc(schema.memory_blocks.priority), desc(schema.memory_blocks.updated_at));
};

export const getAllMemoryBlocksQuerySQL = () => getAllMemoryBlocksQuery().toSQL();

export type GetAllMemoryBlocksResult = Awaited<ReturnType<typeof getAllMemoryBlocksQuery>>[number];

/**
 * Get memory block by ID
 */
export const getMemoryBlockByIdQuery = (id: string) => {
  return db
    .select()
    .from(schema.memory_blocks)
    .where(eq(schema.memory_blocks.id, id));
};

export const getMemoryBlockByIdQuerySQL = (id: string) => getMemoryBlockByIdQuery(id).toSQL();

export type GetMemoryBlockByIdResult = Awaited<ReturnType<typeof getMemoryBlockByIdQuery>>[number];

/**
 * Get count of all memory blocks
 */
export const getMemoryBlocksCountQuery = () => {
  return db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.memory_blocks);
};

export const getMemoryBlocksCountQuerySQL = () => getMemoryBlocksCountQuery().toSQL();

export type GetMemoryBlocksCountResult = Awaited<ReturnType<typeof getMemoryBlocksCountQuery>>[number];

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/**
 * Get all memory blocks ordered by priority
 */
export async function get_all() {
  return db
    .select()
    .from(schema.memory_blocks)
    .orderBy(desc(schema.memory_blocks.priority), desc(schema.memory_blocks.updated_at));
}

/**
 * Get memory block by ID
 */
export async function get_by_id(id: string) {
  const [block] = await db.select().from(schema.memory_blocks).where(eq(schema.memory_blocks.id, id));
  return block ?? null;
}

/**
 * Get memory blocks by type
 */
export async function get_by_type(block_type: 'user_profile' | 'agent_persona' | 'current_goals' | 'context') {
  return db
    .select()
    .from(schema.memory_blocks)
    .where(eq(schema.memory_blocks.block_type, block_type))
    .orderBy(desc(schema.memory_blocks.priority));
}

/**
 * Create a new memory block
 * Note: token_cost is calculated automatically via SQL trigger
 */
export async function create(data: schema.InsertMemoryBlock) {
  const validated = schema.insert_memory_block_schema.parse(data);
  const [block] = await db.insert(schema.memory_blocks).values(validated).returning();
  return block;
}

/**
 * Update a memory block
 * Note: token_cost is calculated automatically via SQL trigger
 */
export async function update(data: schema.UpdateMemoryBlock) {
  const validated = schema.update_memory_block_schema.parse(data);
  const { id, ...updates } = validated;
  const [block] = await db
    .update(schema.memory_blocks)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(schema.memory_blocks.id, id as string))
    .returning();
  return block ?? null;
}

/**
 * Update a single field on a memory block (for inline editing)
 * Bypasses schema validation for fields not in the insert schema
 * Note: token_cost is calculated automatically via SQL trigger
 */
export async function update_field(id: string, field: string, value: string | number) {
  // Whitelist of allowed fields for inline editing
  const allowedFields = [
    'block_type',
    'label',
    'value',
    'char_limit',
    'priority',
    'inclusion_priority'
  ];

  if (!allowedFields.includes(field)) {
    throw new Error(`Field '${field}' is not allowed for inline editing`);
  }

  const updates: Record<string, any> = {
    [field]: value,
    updated_at: new Date()
  };

  const [block] = await db
    .update(schema.memory_blocks)
    .set(updates)
    .where(eq(schema.memory_blocks.id, id))
    .returning();

  return block ?? null;
}

/**
 * Delete a memory block
 */
export async function remove(id: string) {
  await db.delete(schema.memory_blocks).where(eq(schema.memory_blocks.id, id));
}

/**
 * Update last accessed timestamp
 */
export async function mark_accessed(id: string) {
  await db
    .update(schema.memory_blocks)
    .set({ last_accessed: new Date() })
    .where(eq(schema.memory_blocks.id, id));
}

/**
 * Get token costs summed by block type
 */
export const getMemoryBlockTokensByTypeQuery = () => {
  return db
    .select({
      block_type: schema.memory_blocks.block_type,
      total_tokens: sql<number>`COALESCE(SUM(${schema.memory_blocks.token_cost}), 0)::int`.as('total_tokens'),
      count: sql<number>`count(*)::int`.as('count'),
    })
    .from(schema.memory_blocks)
    .groupBy(schema.memory_blocks.block_type);
};

export const getMemoryBlockTokensByTypeQuerySQL = () => getMemoryBlockTokensByTypeQuery().toSQL();

export type GetMemoryBlockTokensByTypeResult = Awaited<ReturnType<typeof getMemoryBlockTokensByTypeQuery>>[number];
