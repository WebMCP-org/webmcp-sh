import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Landing page MCP prompts.
 * These prompts introduce users to WebMCP and provide initial guidance.
 */
export function useMCPLandingPrompts() {
  // 1. "What is WebMCP and how does it work?"
  useWebMCPPrompt({
    name: 'what_is_webmcp',
    description: 'What is WebMCP and how does it work?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please explain WebMCP to me as a newcomer.

Cover:
1. WebMCP as a proposed web standard for AI-website interaction
   - The problem it solves (screen scraping, brittle automation)
   - The solution (structured tool APIs)

2. The three main parts:
   - Tool definitions: Websites declare what actions are possible
   - Client discovery: AI agents detect available tools
   - Execution: Structured API calls instead of UI manipulation

3. Current state:
   - This demo uses a polyfill to implement WebMCP
   - Future goal is browser-native support

4. List the tools currently available on this page using get_current_context or list_all_routes

5. Offer to demonstrate with a simple tool call (like navigating somewhere)

Be welcoming and educational - this is likely the user's first experience with WebMCP.`
          }
        }
      ]
    })
  });

  // 2. "Show me how you interact with this website"
  useWebMCPPrompt({
    name: 'show_interaction_demo',
    description: 'Show me how you interact with this website',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Give me a live demonstration of WebMCP in action.

1. Introduce yourself as Char, a WebMCP client (AI agent)

2. Explain that you don't:
   - Parse HTML
   - Take screenshots
   - Guess coordinates
   - Simulate mouse clicks

3. Instead, call get_current_context and show the structured response you receive

4. Explain the pattern:
   - Tool schema defines what parameters are accepted
   - Description tells you when to use it
   - Handler executes the action
   - You receive structured data back

5. Contrast with traditional approaches:
   - Old way: Screenshot → Vision model → "Click at (x,y)" → Hope it works
   - WebMCP way: Tool call → Guaranteed result

6. Offer to navigate somewhere to show more tools appearing (they're route-scoped)

Make this interactive and engaging!`
          }
        }
      ]
    })
  });

  // 3. "Give me the full WebMCP demo"
  useWebMCPPrompt({
    name: 'full_webmcp_demo',
    description: 'Give me the full WebMCP demo',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Take me on a comprehensive tour of the entire WebMCP demo application.

Walk through each major page in sequence:

1. Dashboard (/dashboard)
   - Show the stats and overview
   - Explain what data is available
   - Demonstrate a dashboard-specific tool

2. Entities (/entities)
   - Explain entity categories (fact, preference, skill, person, project, goal)
   - Create an example entity
   - Show how the table updates

3. Knowledge Graph (/graph)
   - Switch between 2D and 3D views
   - Demonstrate focus and highlight tools
   - Show graph statistics

4. Memory Blocks (/memory-blocks)
   - Explain the difference from entities (always-in-context)
   - Show the block types

5. SQL REPL (/sql-repl)
   - Demonstrate direct database queries
   - Show the schema

For each page:
- Navigate there using the navigate tool
- Explain what tools become available
- Demonstrate 1-2 tools with narration
- Connect back to the WebMCP concept

End with a summary of what was demonstrated.

This should be thorough but engaging - the "executive demo" of WebMCP.`
          }
        }
      ]
    })
  });

  // 4. "How is this different from screen scraping?"
  useWebMCPPrompt({
    name: 'compare_to_screen_scraping',
    description: 'How is this different from screen scraping?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Directly compare WebMCP to traditional screen scraping/automation approaches.

1. Traditional Approach (Screen Scraping):
   - Take a screenshot
   - Send to vision model
   - Parse: "Find the 'New Entity' button"
   - Guess coordinates
   - Simulate click
   - Wait for UI to update
   - Take another screenshot
   - Repeat...

   Problems:
   - Brittle (UI changes break everything)
   - Slow (multiple LLM calls per action)
   - Unreliable (coordinate guessing)
   - Expensive (vision model costs)

2. WebMCP Approach:
   - Discover available tools
   - Call: create_entity({name: "...", category: "fact", ...})
   - Receive structured confirmation
   - Done.

   Benefits:
   - Deterministic (same call, same result)
   - Fast (single operation)
   - Reliable (no guessing)
   - Cheap (no vision processing)

3. DEMONSTRATE by creating an entity using the structured approach
   - Navigate to /entities if needed
   - Create an entity
   - Show how simple and reliable it was

4. Emphasize: No ambiguity, no brittle selectors, no retry loops.`
          }
        }
      ]
    })
  });
}
