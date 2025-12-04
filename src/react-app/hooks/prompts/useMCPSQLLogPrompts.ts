import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * SQL execution log page MCP prompts.
 * These prompts help users understand and analyze query history.
 */
export function useMCPSQLLogPrompts() {
  // 1. "What can I learn from my query history?"
  useWebMCPPrompt({
    name: 'learn_from_query_history',
    description: 'What can I learn from my query history?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze my SQL query history for insights.

1. Query frequency analysis:
   - How many queries have been run?
   - Breakdown by time period
   - Peak usage times

2. Query type distribution:
   - SELECT vs INSERT vs UPDATE vs DELETE
   - What operations are most common?
   - What does this say about usage patterns?

3. Common patterns:
   - Frequently run queries
   - Repeated query patterns
   - Queries that could be saved as views

4. Error analysis:
   - What queries failed?
   - Common error types
   - Suggestions to fix them

5. AI vs Manual:
   - Which queries came from AI (me)?
   - Which were manual user queries?
   - Any patterns in the difference?

6. Recommendations:
   - "You often run this query - consider saving it"
   - "These queries could be combined"
   - "This error keeps happening because..."

Query the sql_execution_log table and provide actionable insights.`
          }
        }
      ]
    })
  });

  // 2. "Show me query patterns and statistics"
  useWebMCPPrompt({
    name: 'query_patterns_statistics',
    description: 'Show me query patterns and statistics',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Detailed statistics view of SQL execution history.

Run analytical queries on the sql_execution_log:

1. Aggregate by query type:
\`\`\`sql
SELECT
  CASE
    WHEN query ILIKE 'SELECT%' THEN 'SELECT'
    WHEN query ILIKE 'INSERT%' THEN 'INSERT'
    WHEN query ILIKE 'UPDATE%' THEN 'UPDATE'
    WHEN query ILIKE 'DELETE%' THEN 'DELETE'
    ELSE 'OTHER'
  END as query_type,
  COUNT(*) as count
FROM sql_execution_log
GROUP BY query_type;
\`\`\`

2. Success vs failure rates:
   - Count successful executions
   - Count errors
   - Calculate success rate

3. Most-queried tables:
   - Parse query text for table names
   - Rank by frequency

4. Time-based patterns:
   - Queries by hour
   - Recent activity
   - Trends over time

5. Error categorization:
   - Group errors by type
   - Show most common failures
   - Suggest fixes

Present this as a "SQL Usage Dashboard" with clear statistics and visualizable data.`
          }
        }
      ]
    })
  });
}
