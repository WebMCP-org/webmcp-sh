import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Entity detail page MCP prompts.
 * These prompts help users understand and manage individual entities.
 */
export function useMCPEntityDetailPrompts() {
  // 1. "Tell me everything about this entity"
  useWebMCPPrompt({
    name: 'entity_full_details',
    description: 'Tell me everything about this entity',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Provide rich context for the currently viewed entity.

1. Get the current context to identify which entity we're viewing

2. Query and display full entity details:
   - All fields with explanations
   - Category meaning and appropriate usage
   - Metadata interpretation

3. List all relationships:
   - Outgoing: "This entity → others"
   - Incoming: "Others → this entity"
   - Explain the relationship types

4. Show access patterns:
   - When was it created?
   - When was it last accessed?
   - How often has it been accessed?

5. Analyze position in knowledge graph:
   - Is this a hub (many connections)?
   - Is this a leaf (few connections)?
   - Is this a bridge (connects different clusters)?

6. Suggest related entities worth connecting:
   - Similar category
   - Related tags
   - Semantic similarity

Make this a comprehensive "dossier" on the entity.`
          }
        }
      ]
    })
  });

  // 2. "How does this connect to my other knowledge?"
  useWebMCPPrompt({
    name: 'entity_connection_analysis',
    description: 'How does this connect to my other knowledge?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze how this entity connects to the broader knowledge graph.

1. Get current context to identify the entity

2. Analyze outgoing relationships:
   - What does this entity connect TO?
   - What types of relationships?
   - What patterns emerge?

3. Analyze incoming relationships:
   - What connects TO this entity?
   - Is this entity a dependency for others?
   - Is it referenced frequently?

4. Describe the "neighborhood":
   - First-degree connections (direct)
   - Second-degree connections (friends of friends)
   - Graph position (central vs peripheral)

5. Classify the entity's role:
   - Hub: Many connections, central to knowledge
   - Leaf: Few connections, specific piece of info
   - Bridge: Connects different clusters

6. Suggest potential new connections:
   - "This skill might relate to that project"
   - "This person could be linked to this goal"
   - Use semantic reasoning

Offer to navigate to the graph view to visualize these connections.`
          }
        }
      ]
    })
  });

  // 3. "What can I do with relationships?"
  useWebMCPPrompt({
    name: 'explain_relationships',
    description: 'What can I do with relationships?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Deep dive into entity relationships - types and usage.

1. Explain all relationship types with examples:

   - knows: Personal/professional connections
     "Alice knows Bob" (between person entities)

   - related_to: General association
     "TypeScript related_to JavaScript" (concepts)

   - depends_on: Hierarchical dependency
     "Project depends_on Skill" (prerequisites)

   - similar_to: Grouping/clustering
     "Python similar_to JavaScript" (both programming)

   - part_of: Composition
     "Feature part_of Project" (containment)

   - causes: Causal relationship
     "Bug causes Issue" (cause and effect)

   - precedes: Temporal sequence
     "Planning precedes Development" (order)

2. For the current entity, show:
   - Existing relationships
   - Which types would make sense to add

3. Demonstrate adding a relationship:
   - Pick an appropriate target entity
   - Choose the right relationship type
   - Create it and explain the result

4. Show how to query relationships via SQL:
   - Find all relationships for an entity
   - Find entities by relationship type`
          }
        }
      ]
    })
  });
}
