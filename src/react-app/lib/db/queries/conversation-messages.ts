import { eq, desc, and } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/**
 * Get messages by session ID
 */
export async function get_by_session_id(session_id: string, options?: { limit?: number }) {
  const { limit = 100 } = options ?? {};

  return db
    .select()
    .from(schema.conversation_messages)
    .where(eq(schema.conversation_messages.session_id, session_id))
    .orderBy(schema.conversation_messages.created_at)
    .limit(limit);
}

/**
 * Get message by ID
 */
export async function get_by_id(id: string) {
  const [message] = await db
    .select()
    .from(schema.conversation_messages)
    .where(eq(schema.conversation_messages.id, id));
  return message ?? null;
}

/**
 * Create a new conversation message
 */
export async function create(data: schema.InsertConversationMessage) {
  const validated = schema.insert_conversation_message_schema.parse(data);
  const [message] = await db.insert(schema.conversation_messages).values(validated).returning();
  return message;
}

/**
 * Delete a conversation message
 */
export async function remove(id: string) {
  await db.delete(schema.conversation_messages).where(eq(schema.conversation_messages.id, id));
}

/**
 * Get messages by role
 */
export async function get_by_role(session_id: string, role: 'user' | 'assistant' | 'system') {
  return db
    .select()
    .from(schema.conversation_messages)
    .where(
      and(
        eq(schema.conversation_messages.session_id, session_id),
        eq(schema.conversation_messages.role, role)
      )
    )
    .orderBy(schema.conversation_messages.created_at);
}

/**
 * Get recent messages across all sessions
 */
export async function get_recent(limit = 20) {
  return db
    .select()
    .from(schema.conversation_messages)
    .orderBy(desc(schema.conversation_messages.created_at))
    .limit(limit);
}
