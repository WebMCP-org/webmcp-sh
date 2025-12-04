import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * SQL REPL page MCP prompts.
 * These prompts help users understand and use direct database access.
 */
export function useMCPSQLPrompts() {
  // 1. "What's the power of direct SQL access?"
  useWebMCPPrompt({
    name: 'sql_power_explanation',
    description: "What's the power of direct SQL access?",
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Explain the power and responsibility of direct SQL access.

1. What's allowed:
   - SELECT: Read any data
   - INSERT: Create new records
   - UPDATE: Modify existing records
   - DELETE: Remove records

2. What's blocked (demonstrate one):
   - DROP TABLE: Can't destroy tables
   - ALTER TABLE: Can't modify schema
   - TRUNCATE: Can't wipe tables
   - Audit log writes: Can't tamper with history

3. Why this matters for WebMCP:
   - Raw power with boundaries
   - AI agents get real capabilities
   - But safety guardrails exist
   - Trust is earned through transparency

4. The audit log:
   - Every change is logged
   - Can't be modified by SQL
   - Full traceability

5. Demonstrate with a safe example:
   - Run a SELECT query
   - Show the results
   - Explain what happened under the hood

Philosophy: Power with responsibility, capability with safety.`
          }
        }
      ]
    })
  });

  // 2. "Teach me the database schema"
  useWebMCPPrompt({
    name: 'teach_database_schema',
    description: 'Teach me the database schema',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Interactive tour of the database schema.

Use get_database_info or run SQL queries to explore:

1. memory_blocks table:
   - Core always-in-context memories
   - Fields: id, block_type, label, value, priority, etc.
   - Query sample data

2. memory_entities table:
   - Structured knowledge items
   - Fields: id, category, name, description, tags, importance_score, etc.
   - Show different categories

3. entity_relationships table:
   - Connections between entities
   - Fields: source_id, target_id, relationship_type
   - How they link the graph

4. conversation_sessions table:
   - Chat history storage
   - Session tracking

5. sql_execution_log table:
   - Query history (meta!)
   - Who ran what, when

6. audit_log table (read-only):
   - Change tracking
   - Protected from modification

For each table:
- Show the structure
- Query sample data
- Explain the purpose
- Show relationships to other tables`
          }
        }
      ]
    })
  });

  // 3. "What are some powerful queries I can run?"
  useWebMCPPrompt({
    name: 'powerful_query_cookbook',
    description: 'What are some powerful queries I can run?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Present a cookbook of powerful SQL queries with explanations.

For each query:
- Show the SQL
- Explain what it does
- Optionally run it to show results

Useful queries:

1. Stale entities (not accessed in 30 days):
\`\`\`sql
SELECT name, category, last_accessed
FROM memory_entities
WHERE last_accessed < NOW() - INTERVAL '30 days'
ORDER BY last_accessed;
\`\`\`

2. Relationship density per entity:
\`\`\`sql
SELECT e.name, COUNT(r.id) as connections
FROM memory_entities e
LEFT JOIN entity_relationships r ON e.id = r.source_id OR e.id = r.target_id
GROUP BY e.id, e.name
ORDER BY connections DESC;
\`\`\`

3. Token budget by category:
\`\`\`sql
SELECT category, SUM(token_count) as total_tokens, COUNT(*) as count
FROM memory_entities
GROUP BY category
ORDER BY total_tokens DESC;
\`\`\`

4. Orphan entities (no relationships):
\`\`\`sql
SELECT e.name, e.category
FROM memory_entities e
WHERE NOT EXISTS (
  SELECT 1 FROM entity_relationships r
  WHERE r.source_id = e.id OR r.target_id = e.id
);
\`\`\`

5. Recent audit trail:
\`\`\`sql
SELECT operation, table_name, timestamp
FROM audit_log
ORDER BY timestamp DESC
LIMIT 10;
\`\`\`

6. Confidence distribution:
\`\`\`sql
SELECT
  CASE
    WHEN confidence >= 90 THEN 'High (90-100)'
    WHEN confidence >= 70 THEN 'Medium (70-89)'
    ELSE 'Low (<70)'
  END as confidence_band,
  COUNT(*) as count
FROM memory_entities
GROUP BY confidence_band;
\`\`\`

Run 2-3 of these to demonstrate real results.`
          }
        }
      ]
    })
  });

  // 4. "Help me write a complex query"
  useWebMCPPrompt({
    name: 'help_write_complex_query',
    description: 'Help me write a complex query',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Interactive query building session.

Guide me through writing a complex SQL query:

1. Ask what I want to find:
   - What data am I looking for?
   - What conditions matter?
   - How should results be organized?

2. Identify relevant tables:
   - Which tables have the data?
   - What joins are needed?
   - Any subqueries required?

3. Build incrementally:
   - Start with basic SELECT
   - Add conditions step by step
   - Explain each clause

4. Run and verify:
   - Execute the query
   - Interpret the results
   - Suggest refinements if needed

5. Explain the query:
   - What each part does
   - Why certain approaches were chosen
   - Performance considerations

If I don't specify what I want, suggest an interesting query to build together, like:
"Let's find all people connected to projects that depend on specific skills"

Make this educational and collaborative!`
          }
        }
      ]
    })
  });

  // 5. "How does the SQL tool protect against misuse?"
  useWebMCPPrompt({
    name: 'sql_security_model',
    description: 'How does the SQL tool protect against misuse?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Explain the SQL tool's security model in detail.

1. Safety layers:
   - Syntax validation before execution
   - DDL blocking (DROP, ALTER, TRUNCATE, CREATE)
   - Audit log write protection
   - Execution logging for all queries

2. Demonstrate blocked operations:
   - Try to DROP a table (will fail)
   - Try to write to audit_log (will fail)
   - Show the error messages

3. What IS allowed (and logged):
   - SELECT: Full read access
   - INSERT/UPDATE/DELETE: With audit trail
   - Show the execution log capturing our queries

4. The trust model:
   - AI agents get real power
   - But destructive operations are blocked
   - Everything is auditable
   - Transparency builds trust

5. Why this matters for WebMCP:
   - Real capabilities, not sandboxed toys
   - Safety through design, not restriction
   - Auditability over permission
   - The website controls what's possible

This demonstrates that WebMCP tools can be powerful yet safe.`
          }
        }
      ]
    })
  });
}
