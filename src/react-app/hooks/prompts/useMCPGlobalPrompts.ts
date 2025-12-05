import { useWebMCPPrompt } from '@mcp-b/react-webmcp';

/**
 * Global MCP prompts that appear on every page.
 * These prompts help users understand WebMCP and navigate the application.
 */
export function useMCPGlobalPrompts() {
  // 1. "Explain the WebMCP architecture"
  useWebMCPPrompt({
    name: 'explain_webmcp_architecture',
    description: 'Explain the WebMCP architecture',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please explain the WebMCP architecture in detail.

Cover the following points:
1. The three-part architecture:
   - Tool definitions: How websites declare their capabilities
   - Client discovery: How AI agents detect available tools
   - Execution: How structured API calls work

2. The current polyfill approach vs. future browser-native support

3. Show me what tools are currently available on this page by using the appropriate tool to list them

4. Explain how tool schemas, descriptions, and handlers work together

This is a teaching moment - help the user understand the technical architecture of WebMCP.`
          }
        }
      ]
    })
  });

  // 2. "Compare this to how other AI agents work"
  useWebMCPPrompt({
    name: 'compare_to_other_agents',
    description: 'Compare this to how other AI agents work',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please compare the WebMCP approach to traditional AI automation methods.

Explain:
1. Traditional screenshot-based agents:
   - Capture screen → vision model → coordinate guessing → simulated clicks
   - The fragility and retry loops involved

2. WebMCP agents:
   - Discover tools → structured call → guaranteed result
   - No clicking, no ambiguity, no retries

3. Demonstrate by performing a simple action on this page using the available tools, and explain how you did it without needing screenshots or coordinate guessing.

4. Emphasize the reliability and determinism of the WebMCP approach.`
          }
        }
      ]
    })
  });

  // 3. "What would WebMCP mean for the web?"
  useWebMCPPrompt({
    name: 'webmcp_vision_for_web',
    description: 'What would WebMCP mean for the web?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Paint the vision of a WebMCP-enabled web.

Describe:
1. Real-world examples:
   - E-commerce: \`add_to_cart({product_id})\` instead of finding buttons
   - Banking: \`transfer({amount, to})\` with proper authentication
   - Social media: \`post({content})\` directly

2. Benefits for everyone:
   - Reliable automation without brittle selectors
   - Accessibility improvements
   - Standardized AI-website interactions

3. The path from polyfill to browser-native support

4. Position this demo as a preview of that future - explain that users can experiment with this paradigm today.

Be inspiring but realistic about the potential of this technology.`
          }
        }
      ]
    })
  });

  // 4. "What page should I be on for [task]?"
  useWebMCPPrompt({
    name: 'navigate_to_page_for_task',
    description: 'What page should I be on for my task?',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Help me navigate to the right page for what I want to do.

First, get the current context to understand where I am.

Then, based on common tasks, explain which pages are best for what:
- Individual memories/knowledge → /entities
- Always-on persistent context → /memory-blocks
- Visual exploration of relationships → /graph
- Complex queries and data analysis → /sql-repl
- Overview and statistics → /dashboard

Ask me what I'm trying to accomplish, or if you can infer from context, suggest the best page and offer to navigate there.

Use the navigate tool if I confirm I want to go somewhere.`
          }
        }
      ]
    })
  });

  // 5. "Walk me through a complete workflow"
  useWebMCPPrompt({
    name: 'complete_workflow_demo',
    description: 'Walk me through a complete workflow',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Walk me through a complete end-to-end workflow that demonstrates WebMCP's power.

Pick a realistic scenario, such as "Set up memory for a new project":

1. Create a project entity with relevant details
2. Create related entities (skills needed, people involved, goals)
3. Connect them with appropriate relationships
4. Add the project to a current_goals memory block
5. Navigate to the graph view to visualize the connections

For each step:
- Explain what tool you're calling and why
- Show how the pieces connect together
- Narrate the WebMCP interaction

This should be an impressive demonstration of tool composition and the power of structured AI-website interaction.`
          }
        }
      ]
    })
  });

  // 6. "Show me how prompts work in WebMCP"
  useWebMCPPrompt({
    name: 'explain_prompts_meta',
    description: 'Show me how prompts work in WebMCP',
    get: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `This is a meta-explanation prompt - explain the MCP prompts system itself.

Cover:
1. What you're experiencing right now - these clickable prompts ARE MCP prompts

2. The difference between tools and prompts:
   - Tools = Actions the agent CAN take (create entity, run SQL, navigate)
   - Prompts = Suggested interactions the website RECOMMENDS

3. How prompts work:
   - The website declares "recommended interactions"
   - Clicking a prompt sends it to the AI agent (me, Char)
   - I then execute it, typically using multiple tools in composition

4. Why prompts matter:
   - They're the website saying "here's how to get value from my tools"
   - They guide users through complex workflows
   - They serve an educational purpose in this demo

5. Demonstrate by explaining what you just did by executing this prompt.`
          }
        }
      ]
    })
  });
}
