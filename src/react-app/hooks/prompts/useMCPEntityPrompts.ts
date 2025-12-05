import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Entities page MCP prompts.
 * These prompts help users manage and understand memory entities.
 */
export function useMCPEntityPrompts() {
  // 1. "What can I do on this page?"
  useWebMCPPrompt({
    name: 'entity_page_capabilities',
    description: 'What can I do on this page?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Give me a comprehensive overview of the Entities page capabilities.

1. List all entity-related tools available:
   - CRUD operations (create, read, update, delete)
   - Table manipulation (filter, sort, search)
   - Batch operations

2. Explain the 8 entity categories:
   - fact: Objective truths about the world or user
   - preference: Subjective likes/dislikes
   - skill: Capabilities and expertise
   - rule: Behavioral guidelines
   - context: Situational information
   - person: People and contacts
   - project: Work items and initiatives
   - goal: Objectives and aspirations

3. Demonstrate table tools:
   - Filter by category
   - Sort by a column
   - Search for a term

4. Explain the relationship between this page and the graph view
   - Entities here appear as nodes in the graph
   - Relationships connect entities

5. Show the create workflow by creating a sample entity.`
          }
        }
      ]
    })
  });

  // 2. "Help me organize my knowledge"
  useWebMCPPrompt({
    name: 'organize_knowledge',
    description: 'Help me organize my knowledge',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform a knowledge audit and help me organize my entities.

1. Find problem areas using SQL queries:
   - Orphan entities (no relationships) - these are disconnected knowledge
   - Low-confidence items (confidence < 70) - need validation
   - Archived items that might be worth reviving
   - Categories that are underrepresented

2. For each issue found, explain:
   - Why it matters
   - What action could help

3. Create a prioritized action plan:
   - "These 3 entities need relationships"
   - "Consider increasing confidence on these validated items"
   - "This category could use more entries"

4. Offer to help address each issue:
   - Create missing relationships
   - Update confidence scores
   - Add new entities

Make this a constructive knowledge organization session.`
          }
        }
      ]
    })
  });

  // 3. "What's the difference between entity types?"
  useWebMCPPrompt({
    name: 'explain_entity_types',
    description: "What's the difference between entity types?",
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Deep dive into entity categories - when to use which type.

For each category, provide:
1. Definition
2. Real example
3. When to use it
4. When NOT to use it

Categories:

- FACT: Objective truths
  Example: "User's birthday is March 15"
  Use for: Verifiable information that doesn't change
  Not for: Opinions or preferences

- PREFERENCE: Subjective likes
  Example: "Prefers dark mode"
  Use for: User choices and tastes
  Not for: Objective facts

- SKILL: Capabilities
  Example: "Expert in TypeScript"
  Use for: Abilities and competencies
  Not for: Facts about unrelated topics

- RULE: Behavioral guidelines
  Example: "Always confirm before deleting"
  Use for: Instructions on how to behave
  Not for: User preferences

- CONTEXT: Situational info
  Example: "Currently working on Project X"
  Use for: Temporary state that changes
  Not for: Permanent facts

- PERSON: People
  Example: "Alex - team lead, alex@example.com"
  Use for: Contact information and relationships
  Not for: General knowledge

- PROJECT: Work items
  Example: "Website Redesign - due Q4"
  Use for: Initiatives and work streams
  Not for: Skills or people

- GOAL: Objectives
  Example: "Learn Rust by end of year"
  Use for: Aspirations and targets
  Not for: Current tasks (use context)

DEMONSTRATE by creating one example of each type.`
          }
        }
      ]
    })
  });

  // 4. "Show me a power-user workflow"
  useWebMCPPrompt({
    name: 'power_user_workflow',
    description: 'Show me a power-user workflow',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Demonstrate advanced entity management techniques.

Show a power-user workflow combining multiple tools:

1. Use SQL to find entities matching complex criteria:
   - Entities created in the last week
   - High importance but low access count
   - Specific tag patterns

2. Demonstrate batch conceptual operations:
   - Find all entities related to a topic
   - Identify gaps in the knowledge graph

3. Create relationships programmatically:
   - Connect related entities
   - Build a knowledge cluster

4. Navigate to graph view to verify connections:
   - Show the visual result
   - Highlight the new connections

5. Explain the tool composition pattern:
   - SQL query → data discovery
   - Entity tools → modifications
   - Navigation → visualization
   - Graph tools → verification

This should showcase the full power of combining tools for complex workflows.`
          }
        }
      ]
    })
  });

  // 5. "Find entities that need attention"
  useWebMCPPrompt({
    name: 'find_entities_needing_attention',
    description: 'Find entities that need attention',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Smart maintenance query - find entities that need attention.

Run SQL queries to identify:

1. Low-confidence entities (confidence < 70):
   - These need validation
   - Present with suggested actions

2. High-importance but neglected:
   - importance_score > 70 but low access_count
   - Why are important items being ignored?

3. Orphan entities:
   - No incoming or outgoing relationships
   - Knowledge that isn't connected

4. Stale entities:
   - Not accessed recently (by last_accessed timestamp)
   - Consider archiving or validating

5. For each category, present:
   - List of matching entities
   - Why this matters
   - Suggested action (update, archive, connect)

Create a prioritized maintenance checklist with specific recommendations.`
          }
        }
      ]
    })
  });
}
