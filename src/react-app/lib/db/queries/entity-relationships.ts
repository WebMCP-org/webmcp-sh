import { eq, desc, sql, count } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/**
 * Get outgoing relationships for an entity
 */
export const getEntityOutgoingRelationshipsQuery = (entityId: string) => {
  return db
    .select({
      relationship: schema.entity_relationships,
      target: schema.memory_entities,
    })
    .from(schema.entity_relationships)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_relationships.to_entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_relationships.from_entity_id, entityId));
};

export const getEntityOutgoingRelationshipsQuerySQL = (entityId: string) => getEntityOutgoingRelationshipsQuery(entityId).toSQL();

export type GetEntityOutgoingRelationshipsResult = Awaited<ReturnType<typeof getEntityOutgoingRelationshipsQuery>>[number];

/**
 * Get incoming relationships for an entity
 */
export const getEntityIncomingRelationshipsQuery = (entityId: string) => {
  return db
    .select({
      relationship: schema.entity_relationships,
      source: schema.memory_entities,
    })
    .from(schema.entity_relationships)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_relationships.from_entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_relationships.to_entity_id, entityId));
};

export const getEntityIncomingRelationshipsQuerySQL = (entityId: string) => getEntityIncomingRelationshipsQuery(entityId).toSQL();

export type GetEntityIncomingRelationshipsResult = Awaited<ReturnType<typeof getEntityIncomingRelationshipsQuery>>[number];

/**
 * Get relationship type statistics
 */
export const getEntityRelationshipStatsQuery = () => {
  return db
    .select({
      relationship_type: schema.entity_relationships.relationship_type,
      count: count(),
      avg_strength: sql<number>`AVG(${schema.entity_relationships.strength})::int`,
    })
    .from(schema.entity_relationships)
    .groupBy(schema.entity_relationships.relationship_type);
};

export const getEntityRelationshipStatsQuerySQL = () => getEntityRelationshipStatsQuery().toSQL();

export type GetEntityRelationshipStatsResult = Awaited<ReturnType<typeof getEntityRelationshipStatsQuery>>[number];

/**
 * Get top connected entities
 */
export const getTopConnectedEntitiesQuery = (limit = 10) => {
  const relationshipCountSql = sql<number>`(
    SELECT COUNT(*)::int
    FROM ${schema.entity_relationships}
    WHERE ${schema.entity_relationships.from_entity_id} = ${schema.memory_entities.id}
    OR ${schema.entity_relationships.to_entity_id} = ${schema.memory_entities.id}
  )`;

  return db
    .select({
      entity: schema.memory_entities,
      relationship_count: relationshipCountSql,
    })
    .from(schema.memory_entities)
    .orderBy(desc(relationshipCountSql))
    .limit(limit);
};

export const getTopConnectedEntitiesQuerySQL = (limit = 10) => getTopConnectedEntitiesQuery(limit).toSQL();

export type GetTopConnectedEntitiesResult = Awaited<ReturnType<typeof getTopConnectedEntitiesQuery>>[number];

/**
 * Get count of all entity relationships
 */
export const getEntityRelationshipsCountQuery = () => {
  return db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.entity_relationships);
};

export const getEntityRelationshipsCountQuerySQL = () => getEntityRelationshipsCountQuery().toSQL();

export type GetEntityRelationshipsCountResult = Awaited<ReturnType<typeof getEntityRelationshipsCountQuery>>[number];

/**
 * Get all entity relationships for graph visualization
 */
export const getAllEntityRelationshipsQuery = () => {
  return db
    .select()
    .from(schema.entity_relationships);
};

export const getAllEntityRelationshipsQuerySQL = () => getAllEntityRelationshipsQuery().toSQL();

export type GetAllEntityRelationshipsResult = Awaited<ReturnType<typeof getAllEntityRelationshipsQuery>>[number];

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/**
 * Get all relationships for an entity
 */
export async function get_by_entity_id(entity_id: string) {
  const outgoing = await db
    .select({
      relationship: schema.entity_relationships,
      target: schema.memory_entities,
    })
    .from(schema.entity_relationships)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_relationships.to_entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_relationships.from_entity_id, entity_id));

  const incoming = await db
    .select({
      relationship: schema.entity_relationships,
      source: schema.memory_entities,
    })
    .from(schema.entity_relationships)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_relationships.from_entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_relationships.to_entity_id, entity_id));

  return { outgoing, incoming };
}

/**
 * Get relationship by ID
 */
export async function get_by_id(id: string) {
  const [relationship] = await db
    .select()
    .from(schema.entity_relationships)
    .where(eq(schema.entity_relationships.id, id));
  return relationship ?? null;
}

/**
 * Create a new entity relationship
 */
export async function create(data: schema.InsertEntityRelationship) {
  const validated = schema.insert_entity_relationship_schema.parse(data);
  const [relationship] = await db.insert(schema.entity_relationships).values(validated).returning();
  return relationship;
}

/**
 * Update an entity relationship
 */
export async function update(data: schema.UpdateEntityRelationship) {
  const validated = schema.update_entity_relationship_schema.parse(data);
  const { id, ...updates } = validated;
  const [relationship] = await db
    .update(schema.entity_relationships)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(schema.entity_relationships.id, id as string))
    .returning();
  return relationship ?? null;
}

/**
 * Delete an entity relationship
 */
export async function remove(id: string) {
  await db.delete(schema.entity_relationships).where(eq(schema.entity_relationships.id, id));
}

/**
 * Get outgoing relationships
 */
export async function get_outgoing(entity_id: string) {
  return db
    .select({
      relationship: schema.entity_relationships,
      target: schema.memory_entities,
    })
    .from(schema.entity_relationships)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_relationships.to_entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_relationships.from_entity_id, entity_id));
}

/**
 * Get incoming relationships
 */
export async function get_incoming(entity_id: string) {
  return db
    .select({
      relationship: schema.entity_relationships,
      source: schema.memory_entities,
    })
    .from(schema.entity_relationships)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_relationships.from_entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_relationships.to_entity_id, entity_id));
}

/**
 * Get relationships by type
 */
export async function get_by_type(relationship_type: string) {
  return db
    .select()
    .from(schema.entity_relationships)
    .where(eq(schema.entity_relationships.relationship_type, relationship_type))
    .orderBy(desc(schema.entity_relationships.strength));
}

/**
 * Get relationship statistics
 */
export async function get_stats() {
  const types = await db
    .select({
      relationship_type: schema.entity_relationships.relationship_type,
      count: sql<number>`count(*)::int`,
      avg_strength: sql<number>`AVG(${schema.entity_relationships.strength})::int`,
    })
    .from(schema.entity_relationships)
    .groupBy(schema.entity_relationships.relationship_type);

  return types;
}
