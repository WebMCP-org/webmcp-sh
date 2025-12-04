import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Memory blocks page MCP prompts.
 * These prompts help users understand and manage always-in-context memory blocks.
 */
export function useMCPMemoryBlockPrompts() {
  // 1. "What are memory blocks and how do I use them?"
  useWebMCPPrompt({
    name: 'explain_memory_blocks',
    description: 'What are memory blocks and how do I use them?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Explain memory blocks - the "always-in-context" memory system.

1. Core concept:
   - Memory blocks are ALWAYS included in context
   - They form the AI's "core memory"
   - Limited slots, high impact

2. Block types:
   - user_profile: Who the user is (name, preferences, background)
   - agent_persona: How the AI should behave (tone, style, rules)
   - current_goals: Active objectives being worked on
   - context: Situational information (current project, mood, etc.)

3. Contrast with entities:
   - Blocks: Few, always present, core identity
   - Entities: Many, structured, tiered storage

4. Show current blocks:
   - Query and display existing blocks
   - Show their token costs

5. Explain priority and inclusion:
   - Higher priority = included first
   - Token budget considerations

Use SQL or available tools to show real data about the blocks.`
          }
        }
      ]
    })
  });

  // 2. "Help me set up my core memories"
  useWebMCPPrompt({
    name: 'setup_core_memories',
    description: 'Help me set up my core memories',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Guide me through setting up each memory block type interactively.

Walk through each block type:

1. USER_PROFILE:
   Ask: "Tell me about yourself - what should I always know about you?"
   Create/update the block with:
   - Name and role
   - Key background info
   - Important characteristics

2. AGENT_PERSONA:
   Ask: "How should I communicate with you?"
   Create/update the block with:
   - Preferred tone (formal, casual, technical)
   - Communication style
   - Any rules to follow

3. CURRENT_GOALS:
   Ask: "What are you working on right now?"
   Create/update the block with:
   - Active projects or objectives
   - Priorities
   - Deadlines if any

4. CONTEXT:
   Ask: "Any situational context I should know?"
   Create/update the block with:
   - Current focus area
   - Temporary constraints
   - Relevant circumstances

For each block:
- Show the tool call being made
- Display the token impact
- Explain why this matters for AI personalization

Make this interactive and collaborative!`
          }
        }
      ]
    })
  });

  // 3. "What's the difference between blocks and entities?"
  useWebMCPPrompt({
    name: 'blocks_vs_entities',
    description: "What's the difference between blocks and entities?",
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Clarify the conceptual difference between memory blocks and entities.

Side-by-side comparison:

MEMORY BLOCKS:
- Always present in context
- Limited slots (4 types)
- Core identity information
- Higher token cost (always loaded)
- Unstructured text
- "Who you are"

MEMORY ENTITIES:
- Structured knowledge base
- Unlimited quantity
- Tiered storage (core/working/reference/archive)
- Efficient retrieval by relevance
- Structured fields (name, category, tags, etc.)
- "What you know"

Analogy:
- Blocks = Your name badge and job title (always visible)
- Entities = Your filing cabinet (retrieved when needed)

Use cases:
- "User prefers dark mode" → ENTITY (preference)
- "I am Alex, a software engineer" → BLOCK (user_profile)
- "Currently working on WebMCP project" → BLOCK (current_goals)
- "WebMCP uses TypeScript" → ENTITY (fact)

Demonstrate with real examples:
- Show existing blocks
- Show some entities
- Explain how they work together`
          }
        }
      ]
    })
  });

  // 4. "Optimize my memory block token usage"
  useWebMCPPrompt({
    name: 'optimize_block_tokens',
    description: 'Optimize my memory block token usage',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze and optimize memory block token usage.

1. Show total token usage by blocks:
   - Query all blocks
   - Calculate/show token counts
   - Show percentage of budget

2. Break down per block:
   - Which block uses the most tokens?
   - Is that appropriate for its importance?

3. Identify optimization opportunities:
   - Verbose blocks that could be trimmed
   - Detailed info that should be entities instead
   - Redundant information

4. Provide specific recommendations:
   - "Your user_profile is 500 tokens - consider moving detailed history to entities"
   - "The current_goals block repeats information from project entities"
   - "Consider using bullet points instead of paragraphs"

5. Token budget context:
   - Explain why block tokens are "expensive" (always loaded)
   - Show impact on overall context window
   - Balance between richness and efficiency

Offer to help implement any optimizations identified.`
          }
        }
      ]
    })
  });
}
