import { z } from 'zod';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { toast } from 'sonner';
import { pg_lite } from '@/lib/db';
import type { Response } from '@/components/CustomRepl';
import { formatSQL } from '@/lib/syntax-highlight';

/**
 * SQL Query Categories
 */
type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DANGEROUS' | 'UNKNOWN';

/**
 * Analyze SQL query to determine type and safety
 */
function analyzeQuery(sql: string): {
  type: QueryType;
  isDangerous: boolean;
  reason?: string;
} {
  const normalizedSQL = sql.trim().toUpperCase();

  // Dangerous operations - ALWAYS block these
  const dangerousPatterns = [
    /DROP\s+(TABLE|DATABASE|SCHEMA|INDEX)/i,
    /TRUNCATE\s+TABLE/i,
    /ALTER\s+TABLE/i,
    /CREATE\s+(TABLE|DATABASE|SCHEMA)/i,
    /GRANT\s+/i,
    /REVOKE\s+/i,
    /;\s*DROP/i, // SQL injection attempt
    /;\s*DELETE/i, // SQL injection attempt
  ];

  // Audit log protection - NEVER allow modifications to audit_log table
  const auditLogPatterns = [
    /DELETE\s+FROM\s+audit_log/i,
    /UPDATE\s+audit_log/i,
    /INSERT\s+INTO\s+audit_log/i,
    /TRUNCATE\s+audit_log/i,
    /DROP\s+.*audit_log/i,
    /ALTER\s+TABLE\s+audit_log/i,
  ];

  // Check audit log protection first
  for (const pattern of auditLogPatterns) {
    if (pattern.test(sql)) {
      return {
        type: 'DANGEROUS',
        isDangerous: true,
        reason: 'AUDIT LOG PROTECTED: Cannot modify, insert, or delete from audit_log table. The audit log is append-only and protected from AI manipulation.',
      };
    }
  }

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      return {
        type: 'DANGEROUS',
        isDangerous: true,
        reason: 'Query contains dangerous DDL operations (DROP, TRUNCATE, ALTER, CREATE, GRANT, REVOKE) or potential SQL injection',
      };
    }
  }

  // DELETE without WHERE clause is dangerous
  if (/DELETE\s+FROM\s+\w+\s*;?\s*$/i.test(sql)) {
    return {
      type: 'DANGEROUS',
      isDangerous: true,
      reason: 'DELETE without WHERE clause would delete all records. Please specify a WHERE condition.',
    };
  }

  // Categorize safe operations
  if (normalizedSQL.startsWith('SELECT')) {
    return { type: 'SELECT', isDangerous: false };
  }

  if (normalizedSQL.startsWith('INSERT')) {
    return { type: 'INSERT', isDangerous: false };
  }

  if (normalizedSQL.startsWith('UPDATE')) {
    // UPDATE without WHERE is risky but allow with warning
    if (!/WHERE/i.test(sql)) {
      return {
        type: 'UPDATE',
        isDangerous: false,
        reason: 'WARNING: UPDATE without WHERE clause will affect all records',
      };
    }
    return { type: 'UPDATE', isDangerous: false };
  }

  if (normalizedSQL.startsWith('DELETE')) {
    return { type: 'DELETE', isDangerous: false };
  }

  return {
    type: 'UNKNOWN',
    isDangerous: false,
    reason: 'Query type could not be determined. Proceeding with caution.',
  };
}

/**
 * Format query results from REPL Response for AI consumption
 */
function formatReplResults(response: Response): string {
  // If error, return error message
  if (response.error) {
    return `❌ Error: ${response.error}`;
  }

  // If text response (from \d commands), return text
  if (response.text) {
    return response.text;
  }

  // If results exist, format them
  if (response.results && response.results.length > 0) {
    const firstResult = response.results[0];
    if (firstResult.rows.length === 0) {
      return 'Query executed successfully. No rows returned.';
    }
    return JSON.stringify(firstResult.rows, null, 2);
  }

  return 'Query executed successfully.';
}

/**
 * Get complete database information - schema, tables, patterns, and best practices
 */
async function getDatabaseInfo(): Promise<string> {
  try {
    // Get all tables
    const tablesResult = await pg_lite.query(`
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // Get all columns for all tables
    const columnsResult = await pg_lite.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    // Organize columns by table
    const schemas: Record<string, unknown[]> = {};
    for (const col of columnsResult.rows) {
      const tableName = (col as { table_name: string }).table_name;
      if (!schemas[tableName]) {
        schemas[tableName] = [];
      }
      schemas[tableName].push(col);
    }

    // Get record counts
    const stats: Record<string, number> = {};
    for (const table of tablesResult.rows) {
      const tableName = (table as { table_name: string }).table_name;
      const countResult = await pg_lite.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      stats[tableName] = Number((countResult.rows[0] as { count: number }).count);
    }

    const info = {
      overview: {
        database: 'AI Memory System (PostgreSQL via PGlite)',
        total_tables: tablesResult.rows.length,
        total_records: Object.values(stats).reduce((a, b) => a + b, 0)
      },
      tables: tablesResult.rows,
      schemas: schemas,
      record_counts: stats,
      key_tables: {
        memory_blocks: "Always-in-context core memories (5-10 most important facts)",
        memory_entities: "Structured knowledge (facts, preferences, skills, people, projects, goals)",
        entity_relationships: "Knowledge graph - how entities connect",
        conversation_sessions: "Conversation threads",
        conversation_messages: "Message history",
        entity_mentions: "Track where entities are mentioned",
        memory_episodes: "Episodic memories (specific events)",
        memory_contexts: "Context scoping (work, personal, projects)",
        entity_contexts: "Entity-to-context mappings",
        memory_triggers: "Associative memory triggers",
        memory_consolidations: "Memory merge/dedup tracking",
        memory_conflicts: "Contradiction detection",
        memory_budget_logs: "Token budget tracking",
        memory_retrieval_logs: "Query analytics"
      },
      powerful_patterns: {
        "1_join_with_json_agg": `-- Get entity with ALL relationships in ONE query
SELECT
  e.id, e.name, e.description, e.category,
  json_agg(json_build_object(
    'relationship', r.relationship_type,
    'related_entity', re.name,
    'strength', r.strength
  )) FILTER (WHERE r.id IS NOT NULL) as relationships
FROM memory_entities e
LEFT JOIN entity_relationships r ON (e.id = r.from_entity_id)
LEFT JOIN memory_entities re ON (r.to_entity_id = re.id)
WHERE e.category = 'skill'
GROUP BY e.id;`,

        "2_relevance_scoring": `-- Complex search with scoring (importance + frequency + recency)
SELECT
  e.*,
  (e.importance_score * 0.4 +
   e.mention_count * 2 +
   CASE WHEN e.last_mentioned > NOW() - INTERVAL '7 days' THEN 30 ELSE 0 END) as relevance_score
FROM memory_entities e
WHERE e.name ILIKE '%keyword%' OR e.description ILIKE '%keyword%' OR 'tag' = ANY(e.tags)
ORDER BY relevance_score DESC
LIMIT 10;`,

        "3_cte_multi_step": `-- CTE for complex multi-step operations
WITH top_entities AS (
  SELECT id, name, importance_score
  FROM memory_entities
  WHERE category IN ('skill', 'preference')
  ORDER BY importance_score DESC
  LIMIT 20
),
entity_with_contexts AS (
  SELECT
    te.name,
    json_agg(json_build_object('context', mc.name, 'relevance', ec.relevance_score)) as contexts
  FROM top_entities te
  LEFT JOIN entity_contexts ec ON te.id = ec.entity_id
  LEFT JOIN memory_contexts mc ON ec.context_id = mc.id
  GROUP BY te.id, te.name
)
SELECT * FROM entity_with_contexts;`,

        "4_batch_insert": `-- Batch insert with relationships
WITH new_entity AS (
  INSERT INTO memory_entities (category, name, description, tags, importance_score)
  VALUES ('skill', 'Advanced SQL', 'Expert at complex queries', ARRAY['database'], 85)
  RETURNING id
),
new_relationships AS (
  INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type, strength)
  SELECT (SELECT id FROM new_entity), e.id, 'related_to', 7
  FROM memory_entities e
  WHERE e.category = 'skill' AND e.name IN ('PostgreSQL', 'Database Design')
  RETURNING *
)
SELECT * FROM new_entity, new_relationships;`,

        "5_window_functions": `-- Window functions for top N per category
SELECT * FROM (
  SELECT
    id, name, category, importance_score,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY importance_score DESC) as rank
  FROM memory_entities
) ranked
WHERE rank <= 3;`,

        "6_knowledge_graph": `-- Most connected entities
SELECT
  e.id, e.name, e.category,
  COUNT(DISTINCT CASE WHEN r.from_entity_id = e.id THEN r.id END) as outgoing,
  COUNT(DISTINCT CASE WHEN r.to_entity_id = e.id THEN r.id END) as incoming,
  COUNT(DISTINCT r.id) as total_connections
FROM memory_entities e
LEFT JOIN entity_relationships r ON (e.id = r.from_entity_id OR e.id = r.to_entity_id)
GROUP BY e.id
ORDER BY total_connections DESC
LIMIT 10;`,

        "7_conversation_with_entities": `-- Messages with mentioned entities
SELECT
  cm.id, cm.role, cm.content, cm.created_at,
  json_agg(json_build_object(
    'entity', me.name,
    'category', me.category,
    'context', em.mention_context
  )) FILTER (WHERE em.id IS NOT NULL) as mentioned_entities
FROM conversation_messages cm
LEFT JOIN entity_mentions em ON cm.id = em.message_id
LEFT JOIN memory_entities me ON em.entity_id = me.id
WHERE cm.session_id = 'session-uuid'
GROUP BY cm.id
ORDER BY cm.created_at DESC;`
      },
      best_practices: [
        "Use JOINs to combine data from multiple tables in ONE query",
        "Use CTEs (WITH clause) for complex multi-step operations",
        "Use json_agg() to aggregate related data into nested structures",
        "Use FILTER (WHERE ...) with aggregates to handle NULL values",
        "Use window functions (ROW_NUMBER, RANK) for per-group analytics",
        "Use array operations (= ANY, && for overlap) for tag filtering",
        "Always include LIMIT to prevent huge result sets",
        "Use RETURNING * with INSERT/UPDATE to get modified data back immediately"
      ],
      important_enums: {
        "memory_blocks.block_type": ["user_profile", "agent_persona", "current_goals", "context"],
        "memory_entities.category": ["fact", "preference", "skill", "rule", "context", "person", "project", "goal"],
        "memory_entities.memory_tier": ["short_term", "working", "long_term", "archived"],
        "memory_entities.memory_type": ["episodic", "semantic"],
        "conversation_messages.role": ["user", "assistant", "system"],
        "memory_episodes.event_type": ["conversation", "action", "observation", "learning"],
        "memory_triggers.trigger_type": ["keyword", "context", "temporal", "emotional", "entity_reference"],
        "memory_consolidations.consolidation_type": ["merge", "summarize", "deduplicate", "refine"],
        "memory_conflicts.conflict_type": ["contradiction", "update", "refinement", "preference_change"],
        "memory_conflicts.resolution_status": ["pending", "resolved", "both_valid", "ignored"]
      }
    };

    return JSON.stringify(info, null, 2);
  } catch (error) {
    return `Error getting database info: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Hook to register SQL MCP tools
 *
 * Provides AI agents with direct SQL access to the memory database
 * with safety guardrails to prevent destructive operations.
 */
export function useMCPSQLTool() {
  // Database info tool - call this ONCE before using sql_query
  useWebMCP({
    name: 'get_database_info',
    description: `Get complete database information including schema, tables, query patterns, and best practices.

⚠️ IMPORTANT: Call this tool ONCE before using sql_query for the first time. It returns everything you need to know about the database structure and how to write powerful queries.

This returns:
- Complete schema for ALL tables (columns, types, constraints)
- Table descriptions and purposes
- Record counts for each table
- 7 powerful query patterns (JOINs, CTEs, window functions, etc.)
- Best practices for efficient querying
- Important enum values

After calling this once, use sql_query for all your database operations.`,
    inputSchema: {},
    annotations: {
      title: 'Get Database Info',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      return await getDatabaseInfo();
    },
  });

  // Main SQL query tool - lightweight, just executes queries
  useWebMCP({
    name: 'sql_query',
    description: `Execute SQL queries against the AI memory database (PostgreSQL via PGlite).

⚠️ FIRST TIME? Call get_database_info tool once to get complete schema and query patterns!

ALLOWED OPERATIONS:
- SELECT: Read any data
- INSERT: Create records
- UPDATE: Modify records (use WHERE clause!)
- DELETE: Remove records (must include WHERE clause)

BLOCKED OPERATIONS:
- DROP, TRUNCATE, ALTER, CREATE
- SQL injection attempts

SAFETY:
✅ SELECT, INSERT, UPDATE (with WHERE), DELETE (with WHERE)
❌ DROP, TRUNCATE, ALTER, CREATE
⚠️ UPDATE/DELETE without WHERE (warns but allows)

💡 TIP: Write ONE powerful query using JOINs and CTEs instead of multiple simple queries! See get_database_info for examples.`,
    inputSchema: {
      query: z.string()
        .min(1, 'SQL query cannot be empty')
        .describe('The SQL query to execute (SELECT, INSERT, UPDATE, DELETE)'),
    },
    annotations: {
      title: 'SQL Query',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    handler: async (input) => {
      const { query: rawQuery } = input;
      const startTime = performance.now();

      // Format the SQL query first
      const query = await formatSQL(rawQuery);

      // Analyze query safety on the formatted query
      const analysis = analyzeQuery(query);

      if (analysis.isDangerous) {
        toast.error('Dangerous query blocked', {
          description: analysis.reason,
        });
        throw new Error(`Dangerous query blocked: ${analysis.reason}`);
      }

      try {
        // Try to execute through REPL UI if available
        let response: Response;

        // Dynamic import to get the REPL ref
        const { replRef } = await import('@/routes/_dashboard.sql-repl');

        if (replRef) {
          // Execute through REPL UI - this will show in the UI AND return results
          // Pass the formatted query so it displays nicely in the REPL
          response = await replRef.executeQuery(query);
        } else {
          // Fallback: Execute directly if REPL not mounted
          const result = await pg_lite.query(query);
          response = {
            query,
            results: [{
              rows: result.rows,
              fields: result.fields,
            }] as Response['results'],
            time: performance.now() - startTime,
          };
        }

        const executionTime = Math.round(performance.now() - startTime);

        // Log to database with formatted query (REPL doesn't log, only displays)
        const resultData = response.results?.[0] ? {
          rows: response.results[0].rows.slice(0, 100),
          fields: response.results[0].fields,
        } : null;

        await pg_lite.query(`
          INSERT INTO sql_execution_log (query, source, success, rows_affected, result_data, execution_time_ms)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          query,  // Now using the formatted query
          'ai',
          !response.error,
          response.results?.[0]?.rows.length || 0,
          resultData ? JSON.stringify(resultData) : null,
          executionTime
        ]);

        // Format results
        let output = formatReplResults(response);

        // Add warning if present
        if (analysis.reason) {
          output = `⚠️ ${analysis.reason}\n\n${output}`;
        }

        // Show toast for successful query
        const rowCount = response.results?.[0]?.rows.length || 0;
        toast.success('SQL query executed', {
          description: `${rowCount} row${rowCount !== 1 ? 's' : ''} returned in ${executionTime}ms`,
        });

        return output;
      } catch (error) {
        const executionTime = Math.round(performance.now() - startTime);
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Log error to database with formatted query
        await pg_lite.query(`
          INSERT INTO sql_execution_log (query, source, success, error_message, execution_time_ms)
          VALUES ($1, $2, $3, $4, $5)
        `, [query, 'ai', false, errorMessage, executionTime]);  // query is already formatted

        toast.error('SQL query failed', {
          description: errorMessage,
        });

        throw new Error(`SQL Error: ${errorMessage}\n\nQuery: ${query}`);
      }
    },
    formatOutput: (output) => output,
  });
}
