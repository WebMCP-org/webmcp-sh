# MCP Prompts Implementation Plan

## Overview

This document outlines the implementation plan for adding MCP prompts to the WebMCP Kitchen Sink demo application. MCP prompts are clickable suggestions that appear in the AI agent's interface, guiding users through the application's capabilities.

### What is WebMCP?

WebMCP is a **proposed web standard** that allows websites to expose structured APIs to AI agents. Instead of agents scraping the DOM or taking screenshots, websites declare tools (functions) that agents can call directly. This demo application:

1. **Uses a polyfill** to implement WebMCP until browser-native support exists
2. **Demonstrates the concept** through a memory/knowledge management system
3. **Features Char**, an embedded WebMCP client (AI agent) that can execute these tools

### Why MCP Prompts?

MCP prompts serve a different purpose than tools:

- **Tools** = Actions the agent CAN take (create entity, run SQL, navigate)
- **Prompts** = Suggested interactions the website RECOMMENDS (guided workflows, explanations, demos)

Prompts are the website saying: "Here's how to get value from my tools."

For this demo application specifically, prompts serve a **meta-educational purpose**: Char (the agent) teaches users about WebMCP BY USING IT. Prompts trigger workflows where Char:

1. Performs actions using the exposed tools
2. Narrates what it's doing
3. Explains how WebMCP works under the hood
4. Demonstrates the difference from traditional screen-scraping approaches

---

## Design Philosophy

### Char as Teacher

The embedded agent "Char" is a WebMCP client that serves as both:
- A functional assistant (does things in the app)
- A narrator/teacher (explains the technology as it works)

Every prompt should embrace this dual role. When Char executes a prompt, it should:
1. Actually perform the requested action(s)
2. Explain what tools it's calling
3. Highlight how this differs from traditional automation
4. Connect the specific action to the broader WebMCP vision

### Prompts Are Compositions, Not Single Actions

Prompts should NOT be simple wrappers around single tools. Users can already see and call individual tools. Prompts should demonstrate:

- **Workflows**: Multi-step processes across tools
- **Tool compositions**: How different tools work together
- **Context-aware guidance**: What makes sense given the current page/state
- **Educational narratives**: The "why" behind the "what"

### Route-Scoped Dynamic Prompts

Prompts are registered per-route, similar to how tools are currently registered. When a user navigates to `/graph`, they see graph-relevant prompts. When they navigate to `/sql-repl`, they see SQL-relevant prompts. This mirrors the existing tool registration pattern.

---

## File Structure

Create a new directory for prompt hooks, parallel to the existing tool hooks:

```
src/react-app/hooks/
├── prompts/                          # NEW DIRECTORY
│   ├── index.ts                      # Barrel export
│   ├── useMCPLandingPrompts.ts       # Landing page prompts
│   ├── useMCPDashboardPrompts.ts     # Dashboard prompts
│   ├── useMCPEntityPrompts.ts        # Entities page prompts
│   ├── useMCPEntityDetailPrompts.ts  # Entity detail page prompts
│   ├── useMCPMemoryBlockPrompts.ts   # Memory blocks page prompts
│   ├── useMCPGraphPrompts.ts         # Knowledge graph prompts
│   ├── useMCPSQLPrompts.ts           # SQL REPL prompts
│   ├── useMCPSQLLogPrompts.ts        # SQL execution log prompts
│   └── useMCPGlobalPrompts.ts        # Cross-cutting prompts (always available)
├── useMCPEntityTools.ts              # Existing
├── useMCPGraphTools.ts               # Existing
├── useMCPGraph3DTools.ts             # Existing
├── useMCPMemoryBlockTools.ts         # Existing
├── useMCPNavigationTool.ts           # Existing
├── useMCPSQLTool.ts                  # Existing
└── useMCPTableTools.ts               # Existing
```

### Why Separate Directory?

1. **Clear separation of concerns**: Tools vs. Prompts are conceptually different
2. **Easier to find**: All prompts in one place
3. **Mirrors existing pattern**: Just like tools have their own files
4. **Scalable**: Easy to add more prompt files as the app grows

---

## Route Integration

Each route file needs to import and call the relevant prompt hooks. This mirrors how tool hooks are currently used.

### Routes and Their Prompt Hooks

| Route File | Prompt Hook(s) to Use |
|------------|----------------------|
| `_landing.index.tsx` | `useMCPLandingPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.dashboard.tsx` | `useMCPDashboardPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.entities.tsx` | `useMCPEntityPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.entities.$entityId.tsx` | `useMCPEntityDetailPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.memory-blocks.tsx` | `useMCPMemoryBlockPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.graph.tsx` | `useMCPGraphPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.sql-repl.tsx` | `useMCPSQLPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.sql-execution-log.tsx` | `useMCPSQLLogPrompts`, `useMCPGlobalPrompts` |
| `_dashboard.about.tsx` | `useMCPGlobalPrompts` |
| `_dashboard.showcase.tsx` | `useMCPGlobalPrompts` |

### Why Global Prompts?

Some prompts make sense on every page:
- "What is WebMCP?"
- "How do you interact with this website?"
- "Compare this to screen scraping"

These are registered via `useMCPGlobalPrompts` and included on all routes.

---

## Detailed Prompt Definitions

### Landing Page Prompts (`useMCPLandingPrompts.ts`)

#### 1. "What is WebMCP and how does it work?"

**Purpose**: Core educational prompt explaining the WebMCP standard.

**What Char Does**:
- Explains WebMCP as a proposed web standard for AI-website interaction
- Describes the three parts: tool definitions, client discovery, execution
- Mentions the current polyfill approach vs. future browser-native support
- Lists the tools currently available on this page
- Offers to demonstrate with a simple tool call

**Why This Prompt**:
The landing page is where users first arrive. They need to understand what they're looking at before diving in. This prompt provides that foundational context.

---

#### 2. "Show me how you interact with this website"

**Purpose**: Live demonstration of WebMCP in action.

**What Char Does**:
- Introduces itself as Char, a WebMCP client
- Explains it doesn't parse HTML or take screenshots
- Calls `get_current_context` and shows the structured response
- Explains the tool schema, description, and handler pattern
- Contrasts with traditional screen-scraping approaches
- Offers to navigate somewhere to show more tools appearing

**Why This Prompt**:
Users learn best by seeing. This prompt shows the actual mechanics of WebMCP with a real tool call and real response.

---

#### 3. "Give me the full WebMCP demo"

**Purpose**: Comprehensive tour of the entire application.

**What Char Does**:
- Navigates through each major page in sequence
- On each page: explains what tools are available, demonstrates one or two, explains the UI response
- Covers: Dashboard (stats), Entities (CRUD), Graph (visualization), SQL (queries)
- Ends with a summary of what was demonstrated
- Total narration explaining how each tool call works

**Why This Prompt**:
For users who want the complete experience without clicking through themselves. A guided tour that showcases everything.

---

#### 4. "How is this different from screen scraping?"

**Purpose**: Direct comparison with traditional automation approaches.

**What Char Does**:
- Describes traditional approach: screenshot → vision model → guess coordinates → simulate clicks
- Describes WebMCP approach: structured API call → guaranteed result
- Gives concrete example: creating an entity
  - Traditional: "Find the 'New Entity' button, click it, wait for modal, fill form fields by label..."
  - WebMCP: `create_entity({name: "...", category: "fact", ...})`
- Emphasizes: no ambiguity, no brittle selectors, no retry loops
- Optionally demonstrates by creating an entity

**Why This Prompt**:
Many users will wonder "why not just use existing automation?" This prompt directly addresses that question with a clear comparison.

---

### Dashboard Prompts (`useMCPDashboardPrompts.ts`)

#### 1. "Explain what you can see and do here"

**Purpose**: Page-specific capability overview with tool demonstration.

**What Char Does**:
- Lists tools available on Dashboard
- Explains the data visible: stats cards, charts, audit log
- Queries underlying data to show it's not reading DOM
- Demonstrates 2-3 key capabilities with narration
- Explains how the UI updates in response to tool calls

**Why This Prompt**:
Orients users to the Dashboard's purpose and demonstrates the tool layer.

---

#### 2. "Walk me through setting up a memory system"

**Purpose**: Guided workflow for new users.

**What Char Does**:
- Creates/edits user_profile memory block (with narration about the tool call)
- Creates agent_persona block
- Creates a few example entities of different types
- Creates relationships between entities
- Shows how token budget is affected
- Explains the difference between blocks (always-in-context) and entities (structured knowledge)

**Why This Prompt**:
New users need to understand how the memory system works. This prompt walks them through setup while teaching.

---

#### 3. "What would a real AI agent do with this data?"

**Purpose**: Explain the practical application of the memory system.

**What Char Does**:
- Queries entities to "learn" user preferences
- Checks memory blocks for context
- Queries relationships to understand concept connections
- Explains how this context would personalize responses in a real scenario
- Describes the vision: persistent memory across conversations

**Why This Prompt**:
Connects the demo to real-world use cases. Users understand WHY this matters.

---

#### 4. "Analyze my knowledge distribution"

**Purpose**: Deep data analysis with insights.

**What Char Does**:
- Queries entities grouped by category
- Queries relationships by type
- Calculates token usage by tier
- Provides insights: "You have lots of facts but few goals..."
- Suggests improvements: "Consider adding relationships to connect isolated entities..."

**Why This Prompt**:
Shows the analytical power of structured data access.

---

### Entities Page Prompts (`useMCPEntityPrompts.ts`)

#### 1. "What can I do on this page?"

**Purpose**: Comprehensive capabilities overview.

**What Char Does**:
- Lists all entity-related tools with explanations
- Explains the 8 entity types and when to use each
- Demonstrates table tools: filter, sort, search
- Shows create/edit workflow
- Explains the relationship between this page and the graph view

**Why This Prompt**:
Complete orientation to the Entities page functionality.

---

#### 2. "Help me organize my knowledge"

**Purpose**: Knowledge audit and improvement workflow.

**What Char Does**:
- Finds orphan entities (no relationships)
- Identifies low-confidence items needing validation
- Finds archived items that might be worth reviving
- Identifies underrepresented categories
- Creates a prioritized action plan
- Offers to help address each issue

**Why This Prompt**:
Proactive maintenance of the knowledge base.

---

#### 3. "What's the difference between entity types?"

**Purpose**: Educational deep-dive on entity categories.

**What Char Does**:
- Explains each category with examples:
  - Facts: objective truths ("User's birthday is March 15")
  - Preferences: subjective likes ("Prefers dark mode")
  - Skills: capabilities ("Knows Python")
  - Rules: behavioral guidelines ("Always confirm before deleting")
  - Context: situational info ("Currently working on Project X")
  - Person/Project/Goal: relational anchors
- Creates one example of each to demonstrate
- Explains when to use which

**Why This Prompt**:
Users often struggle with categorization. This clarifies.

---

#### 4. "Show me a power-user workflow"

**Purpose**: Advanced usage demonstration.

**What Char Does**:
- Uses SQL to find entities matching complex criteria
- Demonstrates batch operations
- Creates relationships programmatically
- Uses graph view to verify connections
- Explains the tool composition: SQL → navigation → entity tools → graph tools

**Why This Prompt**:
Shows the full power of combining tools.

---

#### 5. "Find entities that need attention"

**Purpose**: Smart maintenance query.

**What Char Does**:
- Queries for low-confidence entities
- Finds high-importance but low-access entities
- Identifies entities missing relationships
- Finds stale entities (not accessed recently)
- Presents prioritized list with suggested actions

**Why This Prompt**:
Proactive knowledge base health check.

---

### Entity Detail Page Prompts (`useMCPEntityDetailPrompts.ts`)

#### 1. "Tell me everything about this entity"

**Purpose**: Rich context for the current entity.

**What Char Does**:
- Displays full entity data with explanations
- Explains the category meaning
- Lists all relationships (incoming and outgoing) with context
- Shows access patterns and history
- Suggests related entities worth connecting
- Explains how this entity fits in the broader knowledge graph

**Why This Prompt**:
Deep understanding of a specific entity.

---

#### 2. "How does this connect to my other knowledge?"

**Purpose**: Relationship exploration.

**What Char Does**:
- Analyzes outgoing relationships (this entity → others)
- Analyzes incoming relationships (others → this entity)
- Describes the "neighborhood" in graph terms
- Classifies as hub/leaf/bridge
- Suggests potential new connections

**Why This Prompt**:
Understanding entity context within the knowledge graph.

---

#### 3. "What can I do with relationships?"

**Purpose**: Relationship type education.

**What Char Does**:
- Explains all relationship types:
  - knows: personal connections
  - related_to: general association
  - depends_on: hierarchical dependency
  - similar_to: grouping/clustering
  - part_of: composition
  - causes: causal relationship
  - precedes: temporal sequence
- Demonstrates adding a relationship
- Shows how to query relationships via SQL

**Why This Prompt**:
Users often underutilize relationships. This teaches the options.

---

### Memory Blocks Page Prompts (`useMCPMemoryBlockPrompts.ts`)

#### 1. "What are memory blocks and how do I use them?"

**Purpose**: Core concept explanation.

**What Char Does**:
- Explains blocks as "always-in-context" memories
- Describes the block types:
  - user_profile: who the user is
  - agent_persona: how Char should behave
  - current_goals: active objectives
  - context: situational information
- Contrasts with entities (structured, tiered, unlimited)
- Shows current blocks and their token costs
- Explains priority and inclusion order

**Why This Prompt**:
Foundational understanding of memory blocks.

---

#### 2. "Help me set up my core memories"

**Purpose**: Guided setup workflow.

**What Char Does**:
- Walks through each block type
- Asks questions to populate each:
  - "Tell me about yourself" → user_profile
  - "How should I communicate?" → agent_persona
  - "What are we working on?" → current_goals
  - "Any situational context?" → context
- Creates/updates blocks with narration
- Shows token budget impact

**Why This Prompt**:
Interactive onboarding for memory blocks.

---

#### 3. "What's the difference between blocks and entities?"

**Purpose**: Conceptual clarity.

**What Char Does**:
- Side-by-side comparison:
  - Blocks: always present, limited slots, core identity
  - Entities: structured knowledge, unlimited, tiered
- Use cases: "blocks for who you are, entities for what you know"
- Shows how they work together
- Demonstrates with examples

**Why This Prompt**:
Common confusion point that needs direct addressing.

---

#### 4. "Optimize my memory block token usage"

**Purpose**: Efficiency analysis.

**What Char Does**:
- Shows total token usage by blocks
- Breaks down per block
- Identifies verbose blocks that could be trimmed
- Suggests moving detailed info to entities
- Provides specific optimization recommendations

**Why This Prompt**:
Practical maintenance for token budget management.

---

### Knowledge Graph Page Prompts (`useMCPGraphPrompts.ts`)

#### 1. "What can you do with this visualization?"

**Purpose**: Visualization capabilities overview.

**What Char Does**:
- Explains 2D vs 3D modes and when to use each
- Lists 2D tools: query, focus, statistics, clear highlights
- Lists 3D tools: query, focus, camera tour, clear
- Demonstrates each with narration
- Explains that these are API calls, not UI manipulation

**Why This Prompt**:
Complete orientation to graph capabilities.

---

#### 2. "Give me an interactive tour of my knowledge graph"

**Purpose**: Narrated visual exploration.

**What Char Does**:
- Switches to 3D mode
- Starts camera tour
- Pauses at interesting clusters, explaining what's there
- Highlights patterns: "These skills connect to this project"
- Focuses on key entities
- Ends with statistics summary

**Why This Prompt**:
Engaging visual experience with educational narration.

---

#### 3. "Analyze my knowledge graph structure"

**Purpose**: Structural analysis with insights.

**What Char Does**:
- Reports node and edge counts
- Calculates graph density
- Identifies connected components (clusters)
- Finds the most connected entities (hubs)
- Shows category and relationship type distributions
- Suggests structural improvements

**Why This Prompt**:
Deep analytical view of knowledge graph health.

---

#### 4. "How do I build a better knowledge graph?"

**Purpose**: Best practices education.

**What Char Does**:
- Explains characteristics of good knowledge graphs:
  - No orphan nodes
  - Diverse relationship types
  - Bridge entities connecting clusters
  - Balanced depth
- Analyzes current graph against these criteria
- Provides specific improvement suggestions
- Offers to help implement improvements

**Why This Prompt**:
Actionable guidance for knowledge graph improvement.

---

#### 5. "Show me the most important parts of my knowledge"

**Purpose**: Importance-based visualization.

**What Char Does**:
- Highlights high-importance entities
- Shows paths between important entities
- Identifies hubs (many connections)
- Identifies bridges (connect different clusters)
- Explains why these entities matter

**Why This Prompt**:
Focus on high-value knowledge.

---

### SQL REPL Page Prompts (`useMCPSQLPrompts.ts`)

#### 1. "What's the power of direct SQL access?"

**Purpose**: SQL capabilities and safety explanation.

**What Char Does**:
- Explains that raw SQL access is powerful but controlled
- Shows what's allowed: SELECT, INSERT, UPDATE, DELETE
- Demonstrates a blocked operation (DROP TABLE)
- Explains the safety guardrails
- Emphasizes the WebMCP philosophy: power with boundaries

**Why This Prompt**:
Understanding SQL access scope and safety.

---

#### 2. "Teach me the database schema"

**Purpose**: Interactive schema exploration.

**What Char Does**:
- Calls `get_database_info` for schema
- Queries each table with sample data:
  - memory_blocks: always-in-context
  - memory_entities: structured knowledge
  - entity_relationships: connections
  - conversation_sessions: chat history
  - sql_execution_log: query history
  - audit_log: change tracking (read-only)
- Explains relationships between tables

**Why This Prompt**:
Complete understanding of database structure.

---

#### 3. "What are some powerful queries I can run?"

**Purpose**: Query cookbook with examples.

**What Char Does**:
- Presents and optionally runs useful queries:
  - Entities not accessed in 30 days
  - Relationship density per entity
  - Token budget breakdown by category
  - Audit trail for specific entity
  - Disconnected entities
  - Confidence scores over time
- Explains each query's purpose

**Why This Prompt**:
Practical query examples for power users.

---

#### 4. "Help me write a complex query"

**Purpose**: Interactive query building.

**What Char Does**:
- Asks what the user wants to find
- Suggests relevant tables and joins
- Builds query incrementally with explanation
- Runs the query
- Interprets and explains results

**Why This Prompt**:
Guided SQL query construction.

---

#### 5. "How does the SQL tool protect against misuse?"

**Purpose**: Security model explanation.

**What Char Does**:
- Explains the safety layers:
  - Syntax validation
  - DDL blocking (DROP, ALTER, TRUNCATE)
  - Audit log write protection
  - Execution logging
- Demonstrates blocked operations
- Explains the trust model

**Why This Prompt**:
Transparency about security measures.

---

### SQL Execution Log Prompts (`useMCPSQLLogPrompts.ts`)

#### 1. "What can I learn from my query history?"

**Purpose**: Query pattern analysis.

**What Char Does**:
- Analyzes query frequency and types
- Identifies common patterns
- Shows success/error rates
- Finds recurring queries that could be saved
- Provides insights and recommendations

**Why This Prompt**:
Learning from query history.

---

#### 2. "Show me query patterns and statistics"

**Purpose**: Detailed statistics view.

**What Char Does**:
- Aggregates by query type (SELECT, INSERT, etc.)
- Shows success rates
- Identifies most-queried tables
- Shows time-based patterns
- Highlights errors with suggested fixes

**Why This Prompt**:
Statistical view of SQL usage.

---

### Global Prompts (`useMCPGlobalPrompts.ts`)

These prompts appear on EVERY page.

#### 1. "Explain the WebMCP architecture"

**Purpose**: Technical deep-dive on WebMCP.

**What Char Does**:
- Explains the three-part architecture:
  - Tool definitions (websites declare capabilities)
  - Client discovery (agents detect available tools)
  - Execution (structured API calls)
- Describes current polyfill vs. future browser support
- Shows the current tool list via introspection
- Explains schemas, descriptions, and handlers

**Why This Prompt**:
Technical understanding of WebMCP.

---

#### 2. "Compare this to how other AI agents work"

**Purpose**: Differentiation from alternatives.

**What Char Does**:
- Describes screenshot-based agents:
  - Capture screen → vision model → coordinate guessing → simulated clicks
- Describes WebMCP agents:
  - Discover tools → structured call → guaranteed result
- Demonstrates by performing an action
- Emphasizes: no clicking, no ambiguity, no retries

**Why This Prompt**:
Clear value proposition for WebMCP.

---

#### 3. "What would WebMCP mean for the web?"

**Purpose**: Vision and future implications.

**What Char Does**:
- Paints the vision of WebMCP-enabled web:
  - E-commerce: `add_to_cart({product_id})`
  - Banking: `transfer({amount, to})` with auth
  - Social: `post({content})`
- Explains benefits: reliable automation, no brittle selectors
- Describes the path from polyfill to browser-native
- Positions this demo as a preview of that future

**Why This Prompt**:
Inspiring vision for WebMCP adoption.

---

#### 4. "What page should I be on for [task]?"

**Purpose**: Smart navigation guidance.

**What Char Does**:
- Asks about the user's goal (or infers from context)
- Maps goals to pages:
  - Individual memories → /entities
  - Always-on context → /memory-blocks
  - Visual exploration → /graph
  - Complex queries → /sql-repl
  - Overview → /dashboard
- Explains what tools become available on each page
- Offers to navigate

**Why This Prompt**:
Helpful navigation for confused users.

---

#### 5. "Walk me through a complete workflow"

**Purpose**: End-to-end workflow demonstration.

**What Char Does**:
- Picks a realistic scenario (e.g., "remember you're working on Project X")
- Walks through the full flow:
  1. Create project entity
  2. Create related entities (skills, people, goals)
  3. Connect with relationships
  4. Add to current_goals memory block
  5. Verify in graph view
- Narrates each tool call
- Explains how pieces connect

**Why This Prompt**:
Complete workflow showing tool composition.

---

#### 6. "Show me how prompts work in WebMCP"

**Purpose**: Meta-explanation of prompts themselves.

**What Char Does**:
- Explains that these clickable prompts are MCP prompts
- Describes the difference: tools = actions, prompts = guidance
- Explains the website declares "recommended interactions"
- Shows how clicking a prompt triggers Char to execute it
- Describes it as the website saying "here's how to get value"

**Why This Prompt**:
Self-referential explanation of the prompt system.

---

## Implementation Guidelines

### Prompt Hook Structure

Each prompt hook should follow a consistent pattern:

```typescript
// src/react-app/hooks/prompts/useMCPExamplePrompts.ts

export function useMCPExamplePrompts() {
  // Register each prompt using the appropriate API
  // (The implementing agent will know the exact syntax)

  // Prompt 1
  // - name: unique identifier
  // - description: what appears to the user (the clickable text)
  // - handler: what Char does when invoked

  // Prompt 2
  // ...
}
```

### Naming Conventions

- **Hook names**: `useMCP[Page]Prompts` (e.g., `useMCPDashboardPrompts`)
- **Prompt names**: lowercase_with_underscores (e.g., `explain_memory_system`)
- **Descriptions**: User-facing, conversational (e.g., "What can I do on this page?")

### Handler Implementation Notes

Prompt handlers will need access to:
- Navigation (via router)
- Tool invocation (to call other tools programmatically)
- Toast notifications (for user feedback)
- Current context (to personalize responses)

The handlers should:
1. Acknowledge the prompt
2. Perform actions with narration
3. Explain what's happening
4. Connect to the bigger picture (WebMCP)

### Testing Considerations

Each prompt should be tested for:
- Correct tool calls
- Appropriate narration
- Error handling
- Performance (not too many sequential tool calls)

---

## Implementation Order

Recommended implementation sequence:

### Phase 1: Foundation
1. Create `src/react-app/hooks/prompts/` directory
2. Create `index.ts` barrel export
3. Implement `useMCPGlobalPrompts.ts` (used everywhere)

### Phase 2: Landing Page
4. Implement `useMCPLandingPrompts.ts`
5. Integrate with `_landing.index.tsx`
6. Test the core WebMCP explanation prompts

### Phase 3: Core Pages
7. Implement `useMCPDashboardPrompts.ts`
8. Implement `useMCPEntityPrompts.ts`
9. Implement `useMCPGraphPrompts.ts`
10. Integrate with respective route files

### Phase 4: Supporting Pages
11. Implement `useMCPMemoryBlockPrompts.ts`
12. Implement `useMCPSQLPrompts.ts`
13. Implement `useMCPEntityDetailPrompts.ts`
14. Implement `useMCPSQLLogPrompts.ts`
15. Integrate with respective route files

### Phase 5: Polish
16. Review all prompts for consistency
17. Test complete user journeys
18. Optimize narration for clarity
19. Add any missing prompts discovered during testing

---

## Success Criteria

The implementation is successful when:

1. **Every page has relevant prompts**: Users always have guidance available
2. **Prompts educate about WebMCP**: Not just functional, but explanatory
3. **Char narrates effectively**: Users understand what's happening and why
4. **Tool compositions work smoothly**: Multi-step workflows execute correctly
5. **The demo is compelling**: A user watching Char work understands the WebMCP value proposition

---

## Open Questions

These may need resolution during implementation:

1. **Prompt count limits**: Should there be a max number of prompts per page?
2. **Dynamic prompt content**: Should prompts adapt based on data state (e.g., different prompt if no entities exist)?
3. **Prompt ordering**: How should prompts be ordered in the UI?
4. **Prompt categories**: Should prompts be grouped (e.g., "Educational", "Actions", "Analysis")?

---

## Related Files

For reference during implementation:

- **Existing tool hooks**: `src/react-app/hooks/useMCP*.ts`
- **Route files**: `src/react-app/routes/_dashboard.*.tsx` and `_landing.*.tsx`
- **Navigation tool**: `src/react-app/hooks/useMCPNavigationTool.ts` (good pattern reference)
- **WebMCP integration**: `src/react-app/lib/webmcp/`

---

## Appendix: Quick Reference Table

| Route | Prompt Hook | Key Prompts |
|-------|-------------|-------------|
| `/` | `useMCPLandingPrompts` | What is WebMCP, Full demo, Compare to scraping |
| `/dashboard` | `useMCPDashboardPrompts` | Explain status, Setup workflow, Analyze distribution |
| `/entities` | `useMCPEntityPrompts` | Page capabilities, Organize knowledge, Entity types |
| `/entities/$id` | `useMCPEntityDetailPrompts` | Everything about entity, Connections, Relationships |
| `/memory-blocks` | `useMCPMemoryBlockPrompts` | What are blocks, Setup core memories, Optimize tokens |
| `/graph` | `useMCPGraphPrompts` | Visualization capabilities, Interactive tour, Analyze structure |
| `/sql-repl` | `useMCPSQLPrompts` | SQL power, Teach schema, Query cookbook |
| `/sql-execution-log` | `useMCPSQLLogPrompts` | Query patterns, Statistics |
| All pages | `useMCPGlobalPrompts` | WebMCP architecture, Compare to alternatives, Vision |
