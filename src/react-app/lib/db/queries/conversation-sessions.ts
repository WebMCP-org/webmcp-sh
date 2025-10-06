import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/**
 * Get count of all conversation sessions
 */
export const getConversationSessionsCountQuery = () => {
  return db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.conversation_sessions);
};

export const getConversationSessionsCountQuerySQL = () => getConversationSessionsCountQuery().toSQL();

export type GetConversationSessionsCountResult = Awaited<ReturnType<typeof getConversationSessionsCountQuery>>[number];

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/**
 * Get all sessions ordered by last activity
 */
export async function get_all(options?: { limit?: number; include_ended?: boolean }) {
  const { limit = 50, include_ended = true } = options ?? {};

  if (!include_ended) {
    return db
      .select()
      .from(schema.conversation_sessions)
      .where(sql`${schema.conversation_sessions.ended_at} IS NULL`)
      .orderBy(desc(schema.conversation_sessions.last_activity))
      .limit(limit);
  }

  return db
    .select()
    .from(schema.conversation_sessions)
    .orderBy(desc(schema.conversation_sessions.last_activity))
    .limit(limit);
}

/**
 * Get session by ID
 */
export async function get_by_id(id: string) {
  const [session] = await db
    .select()
    .from(schema.conversation_sessions)
    .where(eq(schema.conversation_sessions.id, id));
  return session ?? null;
}

/**
 * Create a new conversation session
 */
export async function create(data: schema.InsertConversationSession) {
  const validated = schema.insert_conversation_session_schema.parse(data);
  const [session] = await db.insert(schema.conversation_sessions).values(validated).returning();
  return session;
}

/**
 * Update a conversation session
 */
export async function update(data: schema.UpdateConversationSession) {
  const validated = schema.update_conversation_session_schema.parse(data);
  const { id, ...updates } = validated;
  const [session] = await db
    .update(schema.conversation_sessions)
    .set({ ...updates, ended_at: new Date() })
    .where(eq(schema.conversation_sessions.id, id as string))
    .returning();
  return session ?? null;
}

/**
 * Delete a conversation session
 */
export async function remove(id: string) {
  await db.delete(schema.conversation_sessions).where(eq(schema.conversation_sessions.id, id));
}

/**
 * Get active sessions (not ended)
 */
export async function get_active() {
  return db
    .select()
    .from(schema.conversation_sessions)
    .where(sql`${schema.conversation_sessions.ended_at} IS NULL`)
    .orderBy(desc(schema.conversation_sessions.last_activity));
}

/**
 * Update session activity
 */
export async function update_activity(id: string) {
  await db
    .update(schema.conversation_sessions)
    .set({ last_activity: new Date() })
    .where(eq(schema.conversation_sessions.id, id));
}
