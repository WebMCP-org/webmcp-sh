import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Dashboard page MCP prompts.
 * These prompts help users understand and interact with the dashboard overview.
 */
export function useMCPDashboardPrompts() {
  // 1. "Explain what you can see and do here"
  useWebMCPPrompt({
    name: 'explain_dashboard_capabilities',
    description: 'Explain what you can see and do here',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Explain the Dashboard page capabilities and demonstrate some of them.

1. List the tools available on this page (use get_current_context or similar)

2. Explain what data is visible:
   - Stats cards: Memory blocks, entities, relationships, sessions, total tokens
   - Charts: Token usage by category and memory tier
   - Audit log: Protected database changes

3. Demonstrate 2-3 key capabilities:
   - Query the database to show you're not reading the DOM
   - Show how token budgets work
   - Explain what the audit log tracks

4. Explain how the UI updates in response to tool calls - it's reactive, not screenshot-based

5. Connect this to the WebMCP concept: You're seeing structured data, not parsing pixels.`
          }
        }
      ]
    })
  });

  // 2. "Walk me through setting up a memory system"
  useWebMCPPrompt({
    name: 'setup_memory_system',
    description: 'Walk me through setting up a memory system',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Guide me through setting up a complete memory system from scratch.

Step by step:

1. Memory Blocks (navigate to /memory-blocks if needed):
   - Create/edit a user_profile block: "Who is the user?"
   - Create an agent_persona block: "How should you communicate?"
   - Explain these are always-in-context (core identity)

2. Entities (navigate to /entities if needed):
   - Create a few example entities of different types:
     - A "fact" about the user
     - A "preference"
     - A "skill"
   - Explain the tiered storage system

3. Relationships:
   - Create relationships between entities
   - Show how knowledge connects

4. Token Budget:
   - Navigate back to /dashboard
   - Show how token usage is affected
   - Explain the budget model

5. Explain the difference:
   - Blocks = WHO you are (always present, limited)
   - Entities = WHAT you know (structured, unlimited, tiered)

For each step, narrate the tool call you're making.`
          }
        }
      ]
    })
  });

  // 3. "What would a real AI agent do with this data?"
  useWebMCPPrompt({
    name: 'real_agent_use_case',
    description: 'What would a real AI agent do with this data?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Explain how a real AI agent would use this memory system in practice.

1. Query the current state:
   - Check memory blocks for core context
   - Query entities to understand user preferences
   - Look at relationships to understand concept connections

2. Demonstrate "learning" the user:
   - Show what data you can access
   - Explain how this context would personalize responses

3. Real-world scenario:
   - Imagine helping with a task
   - Show how you'd check relevant memories first
   - Explain how this beats starting fresh every conversation

4. The vision:
   - Persistent memory across conversations
   - Growing knowledge over time
   - Personalized assistance based on accumulated context

5. Connect to WebMCP:
   - This isn't magic - it's structured data access
   - Any AI agent with these tools could do the same
   - The website exposes capabilities; the agent uses them`
          }
        }
      ]
    })
  });

  // 4. "Analyze my knowledge distribution"
  useWebMCPPrompt({
    name: 'analyze_knowledge_distribution',
    description: 'Analyze my knowledge distribution',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform a deep analysis of the current knowledge distribution.

Use SQL queries or available tools to analyze:

1. Entity breakdown:
   - Count by category (fact, preference, skill, rule, context, person, project, goal)
   - Which categories are most/least used?

2. Relationship analysis:
   - Count by relationship type (knows, related_to, depends_on, similar_to, part_of, causes, precedes)
   - What patterns emerge?

3. Token usage:
   - Calculate tokens by tier (core, working, reference, archive)
   - What percentage of budget is used?

4. Quality indicators:
   - Find orphan entities (no relationships)
   - Check confidence distribution
   - Look at importance_score patterns

5. Provide insights:
   - "You have lots of facts but few goals..."
   - "Consider adding relationships to connect isolated entities..."
   - "Your token usage is focused on..."

Make specific, actionable recommendations.`
          }
        }
      ]
    })
  });
}
