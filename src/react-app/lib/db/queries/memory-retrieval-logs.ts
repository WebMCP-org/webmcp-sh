import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/**
 * Get logs by session ID
 */
export async function get_by_session_id(session_id: string, options?: { limit?: number }) {
  const { limit = 50 } = options ?? {};

  return db
    .select()
    .from(schema.memory_retrieval_logs)
    .where(eq(schema.memory_retrieval_logs.session_id, session_id))
    .orderBy(desc(schema.memory_retrieval_logs.created_at))
    .limit(limit);
}

/**
 * Get recent retrieval logs
 */
export async function get_recent(limit = 20) {
  return db
    .select()
    .from(schema.memory_retrieval_logs)
    .orderBy(desc(schema.memory_retrieval_logs.created_at))
    .limit(limit);
}

/**
 * Get average retrieval performance
 */
export async function get_performance_stats() {
  const [stats] = await db
    .select({
      avg_time_ms: sql<number>`AVG(${schema.memory_retrieval_logs.retrieval_time_ms})::int`,
      avg_results: sql<number>`AVG(${schema.memory_retrieval_logs.result_count})::int`,
      total_retrievals: sql<number>`count(*)::int`,
    })
    .from(schema.memory_retrieval_logs);

  return stats ?? { avg_time_ms: 0, avg_results: 0, total_retrievals: 0 };
}
