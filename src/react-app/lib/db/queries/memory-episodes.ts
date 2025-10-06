import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryEpisode, UpdateMemoryEpisode, EventType } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all memory episodes ordered by temporal order */
export const getAllMemoryEpisodesQuery = () => {
  return db
    .select()
    .from(schema.memory_episodes)
    .orderBy(desc(schema.memory_episodes.temporal_order));
};

export const getAllMemoryEpisodesQuerySQL = () => getAllMemoryEpisodesQuery().toSQL();

/** Get memory episodes by session */
export const getMemoryEpisodesBySessionQuery = (session_id: string) => {
  return db
    .select()
    .from(schema.memory_episodes)
    .where(eq(schema.memory_episodes.session_id, session_id))
    .orderBy(schema.memory_episodes.temporal_order);
};

export const getMemoryEpisodesBySessionQuerySQL = (session_id: string) =>
  getMemoryEpisodesBySessionQuery(session_id).toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all episodes with optional filters */
export async function get_all(options?: { event_type?: EventType; limit?: number }) {
  const { event_type, limit = 100 } = options ?? {};

  const baseQuery = db.select().from(schema.memory_episodes);

  if (event_type) {
    return baseQuery
      .where(eq(schema.memory_episodes.event_type, event_type))
      .orderBy(desc(schema.memory_episodes.temporal_order))
      .limit(limit);
  }

  return baseQuery.orderBy(desc(schema.memory_episodes.temporal_order)).limit(limit);
}

/** Get episodes by session ID */
export async function get_by_session_id(session_id: string, options?: { limit?: number }) {
  const { limit = 100 } = options ?? {};

  return db
    .select()
    .from(schema.memory_episodes)
    .where(eq(schema.memory_episodes.session_id, session_id))
    .orderBy(schema.memory_episodes.temporal_order)
    .limit(limit);
}

/** Get episode by ID */
export async function get_by_id(id: string) {
  const [episode] = await db
    .select()
    .from(schema.memory_episodes)
    .where(eq(schema.memory_episodes.id, id));
  return episode ?? null;
}

/** Create a new episode */
export async function create(data: InsertMemoryEpisode) {
  const validated = schema.insert_memory_episode_schema.parse(data);
  const [episode] = await db.insert(schema.memory_episodes).values(validated).returning();
  return episode;
}

/** Update an episode */
export async function update(data: UpdateMemoryEpisode) {
  const validated = schema.update_memory_episode_schema.parse(data);
  const { id, ...updates } = validated;
  const [episode] = await db
    .update(schema.memory_episodes)
    .set(updates)
    .where(eq(schema.memory_episodes.id, id as string))
    .returning();
  return episode ?? null;
}

/** Delete an episode */
export async function remove(id: string) {
  await db.delete(schema.memory_episodes).where(eq(schema.memory_episodes.id, id));
}

/** Get episodes by event type */
export async function get_by_event_type(event_type: EventType, limit = 20) {
  return db
    .select()
    .from(schema.memory_episodes)
    .where(eq(schema.memory_episodes.event_type, event_type))
    .orderBy(desc(schema.memory_episodes.temporal_order))
    .limit(limit);
}

/** Get episodes related to specific entities */
export async function get_by_entity_id(entity_id: string) {
  return db
    .select()
    .from(schema.memory_episodes)
    .where(sql`${entity_id} = ANY(${schema.memory_episodes.related_entity_ids})`);
}

/** Get recent episodes */
export async function get_recent(limit = 20) {
  return db
    .select()
    .from(schema.memory_episodes)
    .orderBy(desc(schema.memory_episodes.created_at))
    .limit(limit);
}