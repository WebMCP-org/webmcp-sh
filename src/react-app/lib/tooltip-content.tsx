/**
 * Central repository for all educational tooltip content
 * Explains AI memory concepts throughout the application
 */

export const tooltips = {
  // Dashboard Statistics
  stats: {
    memoryBlocks: (
      <>
        <p className="font-semibold">Always-in-Context Memory</p>
        <p>Memory blocks are persistent information that gets included in every AI request. Think of them as the AI's "working knowledge" - always available without needing to search.</p>
        <p className="text-muted-foreground mt-1">Examples: user preferences, agent persona, current goals</p>
      </>
    ),
    entities: (
      <>
        <p className="font-semibold">Structured Knowledge Items</p>
        <p>Individual pieces of information stored in a searchable database. Unlike memory blocks, entities are retrieved on-demand using SQL queries when relevant.</p>
        <p className="text-muted-foreground mt-1">Categories: facts, preferences, skills, rules, people, projects, goals</p>
      </>
    ),
    relations: (
      <>
        <p className="font-semibold">Knowledge Graph Connections</p>
        <p>Links between entities that represent relationships. These connections help the AI understand how different pieces of information relate to each other.</p>
        <p className="text-muted-foreground mt-1">Example: "John" works-at "Acme Corp"</p>
      </>
    ),
    sessions: (
      <>
        <p className="font-semibold">Conversation Threads</p>
        <p>Independent conversation contexts that maintain their own state. Each session can have its own goals, context, and memory focus.</p>
        <p className="text-muted-foreground mt-1">Useful for: parallel tasks, different projects, isolated contexts</p>
      </>
    ),
    totalTokens: (
      <>
        <p className="font-semibold">Context Budget Usage</p>
        <p>Total estimated tokens used by all memory. Most AI models have a context limit (e.g., 200K tokens for Claude). Managing token usage ensures important information fits.</p>
        <p className="text-muted-foreground mt-1">Calculation: ~4 characters = 1 token</p>
      </>
    ),
  },

  // Token Budget
  tokenBudget: {
    coreMemory: (
      <>
        <p className="font-semibold">Core Memory (Always Included)</p>
        <p>Memory blocks are automatically injected into every AI request. They consume a fixed portion of your context budget but ensure critical information is always available.</p>
        <p className="text-muted-foreground mt-1">Tip: Keep core memory concise and essential</p>
      </>
    ),
    entityMemory: (
      <>
        <p className="font-semibold">Entity Memory (On-Demand)</p>
        <p>Entities are retrieved via SQL queries when relevant to the current context. This allows storing much more information than would fit in the context window.</p>
        <p className="text-muted-foreground mt-1">Benefit: Unlimited storage with selective retrieval</p>
      </>
    ),
    totalContext: (
      <>
        <p className="font-semibold">Total Context Usage</p>
        <p>Percentage of the AI's context window currently used. Staying under 100% ensures all memory can be included. Most models support 100K-200K tokens.</p>
        <p className="text-muted-foreground mt-1">Best practice: Keep under 80% for flexibility</p>
      </>
    ),
  },

  // Memory Tiers
  memoryTiers: {
    short_term: (
      <>
        <p className="font-semibold">Short-Term Memory</p>
        <p>Recently accessed or created memories, typically from the current session. These are temporary and may be promoted to working memory if accessed frequently.</p>
        <p className="text-muted-foreground mt-1">Lifecycle: Created → Accessed → Promoted or Forgotten</p>
      </>
    ),
    working: (
      <>
        <p className="font-semibold">Working Memory</p>
        <p>Actively used memories that are frequently accessed. Automatically promoted from short-term based on access patterns and importance.</p>
        <p className="text-muted-foreground mt-1">Key metric: Promotion score (frequency × importance)</p>
      </>
    ),
    long_term: (
      <>
        <p className="font-semibold">Long-Term Memory</p>
        <p>Consolidated, stable memories for important information. These persist across sessions and form the AI's core knowledge base.</p>
        <p className="text-muted-foreground mt-1">Examples: learned skills, important facts, user preferences</p>
      </>
    ),
    archived: (
      <>
        <p className="font-semibold">Archived Memory</p>
        <p>Historical memories that are rarely accessed but preserved for completeness. Can be retrieved if needed but not actively maintained.</p>
        <p className="text-muted-foreground mt-1">Use case: Historical context, old projects, past events</p>
      </>
    ),
  },

  // Entity Categories
  categories: {
    fact: (
      <>
        <p className="font-semibold">Facts</p>
        <p>Objective, verifiable information about the world. These are statements that are true regardless of perspective or opinion.</p>
        <p className="text-muted-foreground mt-1">Examples: "Paris is the capital of France", "Water boils at 100°C"</p>
      </>
    ),
    preference: (
      <>
        <p className="font-semibold">Preferences</p>
        <p>User likes, dislikes, and personal choices. Understanding preferences helps the AI personalize responses and recommendations.</p>
        <p className="text-muted-foreground mt-1">Examples: "Prefers dark mode", "Likes concise answers"</p>
      </>
    ),
    skill: (
      <>
        <p className="font-semibold">Skills & Knowledge</p>
        <p>Abilities, expertise, and learned capabilities. Can represent both user skills and AI capabilities within specific domains.</p>
        <p className="text-muted-foreground mt-1">Examples: "Expert in Python", "Can analyze SQL queries"</p>
      </>
    ),
    rule: (
      <>
        <p className="font-semibold">Rules & Constraints</p>
        <p>Guidelines, restrictions, and behavioral rules the AI should follow. These shape how the AI responds and what it can or cannot do.</p>
        <p className="text-muted-foreground mt-1">Examples: "Always be polite", "Never share personal data"</p>
      </>
    ),
    context: (
      <>
        <p className="font-semibold">Context Information</p>
        <p>Session-specific or situational information that provides background for the current interaction or task.</p>
        <p className="text-muted-foreground mt-1">Examples: "Working on Project X", "In learning mode"</p>
      </>
    ),
    person: (
      <>
        <p className="font-semibold">People & Relationships</p>
        <p>Information about individuals and their relationships to the user or project. Helps maintain context about team members, contacts, etc.</p>
        <p className="text-muted-foreground mt-1">Examples: "John - Project manager", "Sarah - Designer"</p>
      </>
    ),
    project: (
      <>
        <p className="font-semibold">Projects & Work</p>
        <p>Information about ongoing projects, work items, and initiatives. Helps track project context, requirements, and progress.</p>
        <p className="text-muted-foreground mt-1">Examples: "Website redesign", "Q4 planning"</p>
      </>
    ),
    goal: (
      <>
        <p className="font-semibold">Goals & Objectives</p>
        <p>Current targets, objectives, and desired outcomes. Helps the AI understand what you're trying to achieve and prioritize assistance.</p>
        <p className="text-muted-foreground mt-1">Examples: "Complete feature by Friday", "Learn React"</p>
      </>
    ),
  },

  // Memory Block Types
  blockTypes: {
    user_profile: (
      <>
        <p className="font-semibold">User Profile</p>
        <p>Core information about the user - name, preferences, background. This helps personalize the AI's responses and maintain continuity.</p>
        <p className="text-muted-foreground mt-1">Keep concise: Focus on relevant, stable information</p>
      </>
    ),
    agent_persona: (
      <>
        <p className="font-semibold">Agent Persona</p>
        <p>The AI assistant's personality, communication style, and behavioral guidelines. Defines how the AI should interact and respond.</p>
        <p className="text-muted-foreground mt-1">Example: "Professional but friendly, concise responses"</p>
      </>
    ),
    current_goals: (
      <>
        <p className="font-semibold">Current Goals</p>
        <p>Active objectives and priorities for the current session or time period. Helps the AI focus on what's most important right now.</p>
        <p className="text-muted-foreground mt-1">Update regularly to maintain relevance</p>
      </>
    ),
    context: (
      <>
        <p className="font-semibold">Session Context</p>
        <p>Current situation, environment, or task-specific information. Provides necessary background for the ongoing interaction.</p>
        <p className="text-muted-foreground mt-1">Examples: "Debugging production issue", "Planning phase"</p>
      </>
    ),
  },

  // Technical Concepts
  technical: {
    sqlFirst: (
      <>
        <p className="font-semibold">SQL-First Architecture</p>
        <p>Unlike vector embedding systems, this uses structured SQL queries for memory retrieval. Benefits: transparent, fast, cheap, and debuggable.</p>
        <p className="text-muted-foreground mt-1">Optional: Embeddings can be added later for semantic search</p>
      </>
    ),
    noEmbeddings: (
      <>
        <p className="font-semibold">No Embeddings Required</p>
        <p>This system doesn't require expensive vector embeddings. Instead, it uses structured data and SQL queries, making it faster and more cost-effective.</p>
        <p className="text-muted-foreground mt-1">Trade-off: Less semantic search, more structured retrieval</p>
      </>
    ),
    tokenCost: (
      <>
        <p className="font-semibold">Token Cost Estimation</p>
        <p>Approximate number of tokens this content will use in the AI's context. Calculated as: character count ÷ 4 (rough estimate).</p>
        <p className="text-muted-foreground mt-1">Why it matters: Helps manage context window limits</p>
      </>
    ),
    importanceScore: (
      <>
        <p className="font-semibold">Importance Score (0-100)</p>
        <p>Manual rating of how important this information is. Higher scores mean the memory is more likely to be retained and retrieved.</p>
        <p className="text-muted-foreground mt-1">Guidelines: 0-33 low, 34-66 medium, 67-100 high</p>
      </>
    ),
    confidence: (
      <>
        <p className="font-semibold">Confidence Level (0-100)</p>
        <p>How certain we are about this information's accuracy. Lower confidence memories might need verification or updating.</p>
        <p className="text-muted-foreground mt-1">Use cases: Uncertain facts, preliminary information</p>
      </>
    ),
    promotionScore: (
      <>
        <p className="font-semibold">Promotion Score</p>
        <p>Automatically calculated score (0-100) that determines when memories move from short-term to working memory. Based on access frequency and importance.</p>
        <p className="text-muted-foreground mt-1">Formula: (access_count × importance) ÷ time_elapsed</p>
      </>
    ),
    currentStrength: (
      <>
        <p className="font-semibold">Memory Strength</p>
        <p>Current strength of the memory considering time-based decay. Memories weaken over time unless accessed, mimicking human memory patterns.</p>
        <p className="text-muted-foreground mt-1">Decay rate varies by tier: archived &gt; long-term &gt; working</p>
      </>
    ),
    mentionCount: (
      <>
        <p className="font-semibold">Mention Count</p>
        <p>Number of times this memory has been referenced or accessed. Higher counts indicate more frequently used information.</p>
        <p className="text-muted-foreground mt-1">Used for: Promotion decisions, relevance scoring</p>
      </>
    ),
  },

  // Page Headers
  pageHeaders: {
    dashboard: (
      <>
        <p className="font-semibold">AI Memory Dashboard</p>
        <p>Overview of your AI agent's memory system. Monitor token usage, memory distribution, and recent activity to optimize performance.</p>
      </>
    ),
    memoryBlocks: (
      <>
        <p className="font-semibold">Always-in-Context Memory</p>
        <p>These memory blocks are included in every AI request, ensuring critical information is always available without searching.</p>
      </>
    ),
    entities: (
      <>
        <p className="font-semibold">Structured Knowledge Base</p>
        <p>Searchable database of facts, preferences, and information. Retrieved on-demand via SQL when relevant to the current context.</p>
      </>
    ),
    knowledgeGraph: (
      <>
        <p className="font-semibold">Visual Knowledge Network</p>
        <p>Interactive graph showing how entities connect and relate. Node size indicates importance, colors show categories, edges show relationships.</p>
      </>
    ),
  },

  // Form Fields
  formFields: {
    priority: (
      <>
        <p className="font-semibold">Block Priority</p>
        <p>Determines inclusion order when approaching token limits. Higher priority blocks are included first. Use for critical vs nice-to-have information.</p>
      </>
    ),
    tags: (
      <>
        <p className="font-semibold">Flexible Tags</p>
        <p>Additional categorization beyond the main category. Use tags to group related information for easier retrieval and organization.</p>
        <p className="text-muted-foreground mt-1">Examples: #urgent, #projectX, #technical</p>
      </>
    ),
  },
}