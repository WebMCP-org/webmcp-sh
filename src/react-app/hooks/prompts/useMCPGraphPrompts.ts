import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Knowledge graph page MCP prompts.
 * These prompts help users explore and understand the knowledge graph visualization.
 */
export function useMCPGraphPrompts() {
  // 1. "What can you do with this visualization?"
  useWebMCPPrompt({
    name: 'graph_visualization_capabilities',
    description: 'What can you do with this visualization?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Explain the knowledge graph visualization capabilities.

1. View modes:
   - 2D mode: Flat graph view, good for overview
   - 3D mode: Immersive exploration, dramatic effects

2. List 2D tools available:
   - Query and filter nodes
   - Focus on specific entities
   - Highlight paths between nodes
   - Get graph statistics
   - Clear highlights

3. List 3D tools available:
   - Query and filter
   - Focus with camera movement
   - Camera tour animation
   - Particle effects
   - Clear effects

4. Demonstrate each with narration:
   - Show a focus operation
   - Display statistics
   - Explain these are API calls, not UI clicks

5. Key insight for WebMCP:
   - You're manipulating the visualization through structured tools
   - No coordinate guessing or button clicking
   - Deterministic, reliable operations`
          }
        }
      ]
    })
  });

  // 2. "Give me an interactive tour of my knowledge graph"
  useWebMCPPrompt({
    name: 'interactive_graph_tour',
    description: 'Give me an interactive tour of my knowledge graph',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Take me on a narrated visual tour of the knowledge graph.

1. Switch to 3D mode for dramatic effect

2. Get graph statistics first:
   - Total nodes and edges
   - Category distribution
   - Relationship types

3. Start a camera tour (if available)

4. As we move through the graph, identify and explain:
   - Clusters: "This group of nodes represents..."
   - Hubs: "This entity has many connections..."
   - Bridges: "This entity connects two different areas..."

5. Pause on interesting patterns:
   - Focus on a key entity
   - Highlight its connections
   - Explain what the pattern means

6. End with a summary:
   - Overall graph health
   - Interesting discoveries
   - Suggestions for improvement

Make this an engaging, visual experience with educational commentary.`
          }
        }
      ]
    })
  });

  // 3. "Analyze my knowledge graph structure"
  useWebMCPPrompt({
    name: 'analyze_graph_structure',
    description: 'Analyze my knowledge graph structure',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform structural analysis of the knowledge graph.

Use SQL queries and graph tools to analyze:

1. Basic metrics:
   - Node count (total entities)
   - Edge count (total relationships)
   - Graph density (edges/possible edges)

2. Connectivity analysis:
   - Number of connected components (clusters)
   - Size of largest component
   - Isolated nodes (if any)

3. Hub identification:
   - Find entities with most connections
   - These are your knowledge hubs
   - What categories are they?

4. Distribution analysis:
   - Entities by category
   - Relationships by type
   - Balance/imbalance

5. Path analysis:
   - Find interesting paths between entities
   - Show how knowledge connects

6. Quality assessment:
   - Are there orphan nodes?
   - Is the graph well-connected?
   - Are relationship types diverse?

Provide specific recommendations:
- "Consider connecting these isolated entities..."
- "Your graph is hub-dominated, consider more bridges..."
- "Add more 'depends_on' relationships to show dependencies..."`
          }
        }
      ]
    })
  });

  // 4. "How do I build a better knowledge graph?"
  useWebMCPPrompt({
    name: 'build_better_graph',
    description: 'How do I build a better knowledge graph?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Teach me best practices for knowledge graph construction.

1. Characteristics of a good knowledge graph:
   - No orphan nodes (everything connected)
   - Diverse relationship types (not just "related_to")
   - Bridge entities that connect clusters
   - Balanced depth (not too flat, not too deep)
   - Meaningful categories (not everything is "fact")

2. Analyze my current graph against these criteria:
   - Run queries to check each characteristic
   - Score or rate each aspect

3. Common mistakes to avoid:
   - Creating entities without relationships
   - Overusing generic relationships
   - Ignoring category semantics
   - Flat graphs with no structure

4. Improvement strategies:
   - Add relationships to orphans
   - Diversify relationship types
   - Create bridge entities for related concepts
   - Use categories meaningfully

5. Provide specific, actionable improvements:
   - "Entity X should connect to Y"
   - "Use 'depends_on' instead of 'related_to' here"
   - "Create a project entity to group these skills"

Offer to help implement improvements.`
          }
        }
      ]
    })
  });

  // 5. "Show me the most important parts of my knowledge"
  useWebMCPPrompt({
    name: 'show_important_knowledge',
    description: 'Show me the most important parts of my knowledge',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Identify and visualize the most important parts of the knowledge graph.

1. Find high-importance entities:
   - Query by importance_score
   - Highlight them in the graph

2. Find knowledge hubs:
   - Entities with many connections
   - These are central to your knowledge

3. Find bridges:
   - Entities that connect different clusters
   - Critical for knowledge integration

4. Visualize importance:
   - Focus on high-importance entities
   - Show paths between them

5. For each important entity, explain:
   - Why it's important (connections, score, category)
   - What it connects
   - What would be lost without it

6. Identify gaps:
   - Are there important entities that should be more connected?
   - Are there obvious missing connections?

Present this as a "knowledge importance map" with visual demonstration.`
          }
        }
      ]
    })
  });
}
