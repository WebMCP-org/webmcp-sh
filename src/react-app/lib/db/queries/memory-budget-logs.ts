import { eq, desc, sql, gte, lte, and } from 'drizzle-orm';
import { db } from '../database';
import * as schema from '../schema';
import type { InsertMemoryBudgetLog } from '../types';

// ============================================================================
// LIVE QUERY HELPERS (for useLiveQuery)
// ============================================================================

/** Get all budget logs */
export const getAllMemoryBudgetLogsQuery = () => {
  return db
    .select()
    .from(schema.memory_budget_logs)
    .orderBy(desc(schema.memory_budget_logs.timestamp));
};

export const getAllMemoryBudgetLogsQuerySQL = () => getAllMemoryBudgetLogsQuery().toSQL();

/** Get budget logs by session */
export const getMemoryBudgetLogsBySessionQuery = (session_id: string) => {
  return db
    .select()
    .from(schema.memory_budget_logs)
    .where(eq(schema.memory_budget_logs.session_id, session_id))
    .orderBy(desc(schema.memory_budget_logs.timestamp));
};

export const getMemoryBudgetLogsBySessionQuerySQL = (session_id: string) =>
  getMemoryBudgetLogsBySessionQuery(session_id).toSQL();

// ============================================================================
// ASYNC CRUD OPERATIONS
// ============================================================================

/** Get all budget logs with optional filters */
export async function get_all(options?: { session_id?: string; limit?: number }) {
  const { session_id, limit = 100 } = options ?? {};

  const baseQuery = db.select().from(schema.memory_budget_logs);

  if (session_id) {
    return baseQuery
      .where(eq(schema.memory_budget_logs.session_id, session_id))
      .orderBy(desc(schema.memory_budget_logs.timestamp))
      .limit(limit);
  }

  return baseQuery.orderBy(desc(schema.memory_budget_logs.timestamp)).limit(limit);
}

/** Get budget log by ID */
export async function get_by_id(id: string) {
  const [log] = await db
    .select()
    .from(schema.memory_budget_logs)
    .where(eq(schema.memory_budget_logs.id, id));
  return log ?? null;
}

/** Get budget logs by session ID */
export async function get_by_session_id(session_id: string, options?: { limit?: number }) {
  const { limit = 100 } = options ?? {};

  return db
    .select()
    .from(schema.memory_budget_logs)
    .where(eq(schema.memory_budget_logs.session_id, session_id))
    .orderBy(desc(schema.memory_budget_logs.timestamp))
    .limit(limit);
}

/** Create a new budget log */
export async function create(data: InsertMemoryBudgetLog) {
  const validated = schema.insert_memory_budget_log_schema.parse(data);
  const [log] = await db.insert(schema.memory_budget_logs).values(validated).returning();
  return log;
}

/** Delete a budget log */
export async function remove(id: string) {
  await db.delete(schema.memory_budget_logs).where(eq(schema.memory_budget_logs.id, id));
}

/** Get recent budget logs */
export async function get_recent(limit = 20) {
  return db
    .select()
    .from(schema.memory_budget_logs)
    .orderBy(desc(schema.memory_budget_logs.timestamp))
    .limit(limit);
}

/** Get budget usage statistics */
export async function get_usage_stats() {
  const result = await db
    .select({
      avg_tokens_available: sql<number>`avg(${schema.memory_budget_logs.total_tokens_available})::int`,
      avg_tokens_used: sql<number>`avg(${schema.memory_budget_logs.tokens_used})::int`,
      avg_utilization: sql<number>`avg(${schema.memory_budget_logs.tokens_used}::float / NULLIF(${schema.memory_budget_logs.total_tokens_available}, 0))::float`,
      total_logs: sql<number>`count(*)::int`,
    })
    .from(schema.memory_budget_logs);

  return result[0];
}

/** Get budget logs within a time range */
export async function get_by_time_range(start: Date, end: Date) {
  return db
    .select()
    .from(schema.memory_budget_logs)
    .where(
      and(
        gte(schema.memory_budget_logs.timestamp, start),
        lte(schema.memory_budget_logs.timestamp, end)
      )
    )
    .orderBy(desc(schema.memory_budget_logs.timestamp));
}

/** Get over-budget logs (where usage exceeded available) */
export async function get_over_budget() {
  return db
    .select()
    .from(schema.memory_budget_logs)
    .where(sql`${schema.memory_budget_logs.tokens_used} > ${schema.memory_budget_logs.total_tokens_available}`)
    .orderBy(desc(schema.memory_budget_logs.timestamp));
}

/** Log budget usage for a session */
export async function log_budget_usage(
  session_id: string | null,
  total_tokens_available: number,
  tokens_used: number,
  memories_included: string[],
  memories_excluded: string[]
) {
  return create({
    session_id,
    total_tokens_available,
    tokens_used,
    memories_included,
    memories_excluded,
  });
}

/** Get efficiency metrics per session */
export async function get_session_efficiency_stats(session_id: string) {
  const result = await db
    .select({
      session_id: schema.memory_budget_logs.session_id,
      avg_utilization: sql<number>`avg(${schema.memory_budget_logs.tokens_used}::float / NULLIF(${schema.memory_budget_logs.total_tokens_available}, 0))::float`,
      total_tokens_used: sql<number>`sum(${schema.memory_budget_logs.tokens_used})::int`,
      log_count: sql<number>`count(*)::int`,
    })
    .from(schema.memory_budget_logs)
    .where(eq(schema.memory_budget_logs.session_id, session_id))
    .groupBy(schema.memory_budget_logs.session_id);

  return result[0];
}