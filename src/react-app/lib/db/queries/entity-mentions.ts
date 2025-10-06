import { eq, desc } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/**
 * Get entity mentions by entity ID
 */
export const getEntityMentionsByEntityIdQuery = (entityId: string, limit = 10) => {
  return db
    .select({
      mention: schema.entity_mentions,
      message: schema.conversation_messages,
      session: schema.conversation_sessions,
    })
    .from(schema.entity_mentions)
    .leftJoin(
      schema.conversation_messages,
      eq(schema.entity_mentions.message_id, schema.conversation_messages.id)
    )
    .leftJoin(
      schema.conversation_sessions,
      eq(schema.entity_mentions.session_id, schema.conversation_sessions.id)
    )
    .where(eq(schema.entity_mentions.entity_id, entityId))
    .orderBy(desc(schema.entity_mentions.created_at))
    .limit(limit);
};

export const getEntityMentionsByEntityIdQuerySQL = (entityId: string, limit = 10) => getEntityMentionsByEntityIdQuery(entityId, limit).toSQL();

export type GetEntityMentionsByEntityIdResult = Awaited<ReturnType<typeof getEntityMentionsByEntityIdQuery>>[number];

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/**
 * Get mentions for an entity
 */
export async function get_by_entity_id(entity_id: string, options?: { limit?: number }) {
  const { limit = 50 } = options ?? {};

  return db
    .select({
      mention: schema.entity_mentions,
      message: schema.conversation_messages,
      session: schema.conversation_sessions,
    })
    .from(schema.entity_mentions)
    .leftJoin(
      schema.conversation_messages,
      eq(schema.entity_mentions.message_id, schema.conversation_messages.id)
    )
    .leftJoin(
      schema.conversation_sessions,
      eq(schema.entity_mentions.session_id, schema.conversation_sessions.id)
    )
    .where(eq(schema.entity_mentions.entity_id, entity_id))
    .orderBy(desc(schema.entity_mentions.created_at))
    .limit(limit);
}

/**
 * Get mention by ID
 */
export async function get_by_id(id: string) {
  const [mention] = await db
    .select()
    .from(schema.entity_mentions)
    .where(eq(schema.entity_mentions.id, id));
  return mention ?? null;
}

/**
 * Create a new entity mention
 */
export async function create(data: schema.InsertEntityMention) {
  const validated = schema.insert_entity_mention_schema.parse(data);
  const [mention] = await db.insert(schema.entity_mentions).values(validated).returning();
  return mention;
}

/**
 * Delete an entity mention
 */
export async function remove(id: string) {
  await db.delete(schema.entity_mentions).where(eq(schema.entity_mentions.id, id));
}

/**
 * Get mentions in a session
 */
export async function get_by_session_id(session_id: string) {
  return db
    .select({
      mention: schema.entity_mentions,
      entity: schema.memory_entities,
    })
    .from(schema.entity_mentions)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_mentions.entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_mentions.session_id, session_id))
    .orderBy(desc(schema.entity_mentions.created_at));
}

/**
 * Get mentions for a message
 */
export async function get_by_message_id(message_id: string) {
  return db
    .select({
      mention: schema.entity_mentions,
      entity: schema.memory_entities,
    })
    .from(schema.entity_mentions)
    .leftJoin(
      schema.memory_entities,
      eq(schema.entity_mentions.entity_id, schema.memory_entities.id)
    )
    .where(eq(schema.entity_mentions.message_id, message_id));
}
