import { db } from './database';
import * as schema from './schema';

/**
 * Seed the database with AI agent memory examples
 * Only runs once - checks if data already exists
 */
export async function seedDatabase() {
  try {
    // Check if database is already seeded
    let existing_sessions = [];
    try {
      existing_sessions = await db.select().from(schema.conversation_sessions);
    } catch {
      // Tables don't exist yet - skip seeding
      return;
    }

    if (existing_sessions.length > 0) {
      return; // Database already seeded
    }

    // Verify all required tables exist before seeding
    try {
      await db.select().from(schema.memory_contexts).limit(0);
      await db.select().from(schema.memory_entities).limit(0);
      await db.select().from(schema.entity_contexts).limit(0);
    } catch {
      // Required tables not ready yet
      return;
    }

    const now = new Date();
    const days_ago = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const hours_ago = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

    // ========================================
    // MEMORY BLOCKS - Core always-in-context memory
    // ========================================
    await db.insert(schema.memory_blocks).values([
      {
        block_type: 'user_profile' as const,
        label: 'User Identity',
        value: 'Developer exploring WebMCP - a W3C web standard being incubated by the Web Machine Learning Community Group. WebMCP enables websites to expose AI-callable tools through navigator.modelContext, allowing AI agents like Char to interact with web applications directly.',
        metadata: { source: 'initial_setup', technology: 'WebMCP', standard: 'W3C' },
        char_limit: 500,
        priority: 100,
        inclusion_priority: 95,
        created_at: days_ago(7),
        updated_at: days_ago(1),
        last_accessed: hours_ago(2),
      },
      {
        block_type: 'current_goals' as const,
        label: 'Active Goals',
        value: 'Learning WebMCP (W3C Web Model Context API) and building applications that expose tools to AI agents via navigator.modelContext. Exploring how Char and other in-page agents can leverage client-side tools like PGlite databases and browser APIs.',
        metadata: { project: 'webmcp-learning', focus: 'ai-agents', agent: 'Char' },
        char_limit: 300,
        priority: 90,
        inclusion_priority: 90,
        created_at: days_ago(3),
        updated_at: hours_ago(5),
        last_accessed: hours_ago(1),
      },
      {
        block_type: 'agent_persona' as const,
        label: 'Agent Context',
        value: 'I am Char, an in-page AI agent powered by MCP-B. I can interact with WebMCP-enabled websites through the navigator.modelContext API to read/write memories, execute SQL queries, and access web resources - all running client-side with human-in-the-loop oversight.',
        metadata: { protocol: 'MCP', implementation: 'MCP-B', agent: 'Char' },
        char_limit: 400,
        priority: 80,
        inclusion_priority: 85,
        created_at: days_ago(7),
        updated_at: days_ago(7),
        last_accessed: hours_ago(1),
      },
      {
        block_type: 'context' as const,
        label: 'WebMCP Overview',
        value: 'WebMCP is a W3C web standard (incubated by Web Machine Learning CG) that extends MCP to browsers via navigator.modelContext. MCP-B is the reference implementation providing the polyfill. Char is MCP-B\'s in-page AI agent that interacts with WebMCP-enabled websites. The standard focuses on human-in-the-loop use cases.',
        metadata: { source: 'documentation', standard: 'W3C', implementation: 'MCP-B', agent: 'Char' },
        char_limit: 500,
        priority: 95,
        inclusion_priority: 92,
        created_at: days_ago(7),
        updated_at: days_ago(1),
        last_accessed: hours_ago(1),
      },
    ]);

    // ========================================
    // CONVERSATION SESSION
    // ========================================
    const [session1, session2, session3] = await db.insert(schema.conversation_sessions).values([
      {
        title: 'WebMCP & W3C Standard',
        summary: 'Explored WebMCP as a W3C web standard being incubated by the Web Machine Learning Community Group. Discussed navigator.modelContext API, MCP-B as the reference implementation, and Char as the in-page AI agent.',
        message_count: 10,
        entity_count: 15,
        started_at: days_ago(5),
        last_activity: days_ago(4),
        ended_at: days_ago(4),
      },
      {
        title: 'Building WebMCP Tools with Char',
        summary: 'Learning how to create tools that Char and other in-page agents can invoke via navigator.modelContext. Covered tool schemas, parameter validation, and human-in-the-loop patterns.',
        message_count: 8,
        entity_count: 8,
        started_at: days_ago(3),
        last_activity: hours_ago(2),
        ended_at: null,
      },
      {
        title: 'MCP-B Architecture & In-Page Agents',
        summary: 'Deep dive into MCP-B architecture including Tab Transports, Extension Transports, and the specialized agents (Userscript Engineer, WebMCP Server, Browsing Agent, Chat Companion). Focus on Char as the main in-page agent.',
        message_count: 6,
        entity_count: 6,
        started_at: days_ago(2),
        last_activity: days_ago(2),
        ended_at: days_ago(2),
      },
    ]).returning();

    // ========================================
    // MEMORY CONTEXTS - Context scoping
    // ========================================
    const contexts = await db.insert(schema.memory_contexts).values([
      {
        name: 'webmcp_standard',
        description: 'W3C WebMCP standard, navigator.modelContext API, and Web Machine Learning CG',
        color: '#3b82f6',
        active: true,
        created_at: days_ago(7),
        updated_at: days_ago(1),
      },
      {
        name: 'mcp_protocol',
        description: 'Model Context Protocol specifications and Anthropic standards',
        color: '#8b5cf6',
        active: true,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      {
        name: 'browser_technologies',
        description: 'Browser APIs and technologies that enable WebMCP',
        parent_context_id: null,
        color: '#10b981',
        active: true,
        created_at: days_ago(5),
        updated_at: hours_ago(1),
      },
      {
        name: 'in_page_agents',
        description: 'Char and other in-page AI agents that interact with WebMCP websites',
        color: '#f59e0b',
        active: true,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },
      {
        name: 'mcp_b_ecosystem',
        description: 'MCP-B reference implementation, extensions, and tooling',
        color: '#ec4899',
        active: true,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
    ]).returning();

    const contextMap: Record<string, typeof contexts[0]> = {};
    contexts.forEach(c => {
      contextMap[c.name] = c;
    });

    // ========================================
    // MEMORY ENTITIES - Structured knowledge
    // ========================================
    const entities = await db.insert(schema.memory_entities).values([
      // CORE WEBMCP CONCEPTS
      {
        category: 'fact',
        name: 'WebMCP',
        description: 'WebMCP (Web Model Context Protocol) is a W3C web standard being incubated by the Web Machine Learning Community Group. It enables websites to expose AI-callable tools through the browser\'s navigator.modelContext API, allowing AI agents to interact with web applications directly without backend infrastructure.',
        tags: ['webmcp', 'mcp', 'browser', 'protocol', 'w3c', 'standard'],
        confidence: 100,
        source_type: 'manual',
        source_session_id: session1.id,
        mention_count: 25,
        last_mentioned: hours_ago(1),
        importance_score: 100,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 50,
        last_accessed: hours_ago(1),
        promotion_score: 100,
        decay_rate: 1,
        last_reinforced: hours_ago(1),
        current_strength: 100,
        created_at: days_ago(7),
        updated_at: hours_ago(1),
      },
      {
        category: 'fact',
        name: 'Model Context Protocol',
        description: 'MCP (Model Context Protocol) is an open protocol created by Anthropic that standardizes how AI applications provide context to Large Language Models. It defines schemas for tools, resources, and prompts that AI systems can discover and use. WebMCP extends MCP to browsers via the W3C Web Model Context API.',
        tags: ['mcp', 'protocol', 'anthropic', 'standard'],
        confidence: 100,
        source_type: 'manual',
        source_session_id: session1.id,
        mention_count: 18,
        last_mentioned: days_ago(1),
        importance_score: 95,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 35,
        last_accessed: days_ago(1),
        promotion_score: 95,
        decay_rate: 2,
        last_reinforced: days_ago(1),
        current_strength: 98,
        created_at: days_ago(7),
        updated_at: days_ago(1),
      },
      {
        category: 'fact',
        name: 'MCP Tools',
        description: 'MCP tools are functions that AI agents can invoke through the protocol. Each tool has a JSON schema defining its name, description, and input parameters. Tools can perform actions like database queries, API calls, or file operations.',
        tags: ['mcp', 'tools', 'functions', 'schema'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session2.id,
        mention_count: 12,
        last_mentioned: hours_ago(2),
        importance_score: 90,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 28,
        last_accessed: hours_ago(2),
        promotion_score: 92,
        decay_rate: 3,
        last_reinforced: hours_ago(2),
        current_strength: 95,
        created_at: days_ago(5),
        updated_at: hours_ago(2),
      },
      {
        category: 'fact',
        name: 'In-Page AI Agents',
        description: 'In-page AI agents like Char run directly in the browser, interacting with WebMCP-enabled websites through navigator.modelContext. These agents operate with human-in-the-loop oversight, accessing client-side tools without server dependencies. MCP-B provides specialized agents: Userscript Engineer, WebMCP Server, Browsing Agent, and Chat Companion.',
        tags: ['ai-agents', 'browser', 'webmcp', 'char', 'in-page', 'mcp-b'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session1.id,
        mention_count: 15,
        last_mentioned: days_ago(1),
        importance_score: 92,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 30,
        last_accessed: days_ago(1),
        promotion_score: 90,
        decay_rate: 3,
        last_reinforced: days_ago(1),
        current_strength: 96,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },
      {
        category: 'fact',
        name: 'Char',
        description: 'Char is MCP-B\'s primary in-page AI agent that interacts with WebMCP-enabled websites. It operates through the navigator.modelContext API, enabling direct tool invocation on web pages with human-in-the-loop oversight. Char represents the main product direction for MCP-B.',
        tags: ['char', 'ai-agent', 'mcp-b', 'in-page', 'webmcp'],
        confidence: 100,
        source_type: 'manual',
        source_session_id: session1.id,
        mention_count: 20,
        last_mentioned: hours_ago(1),
        importance_score: 95,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 35,
        last_accessed: hours_ago(1),
        promotion_score: 95,
        decay_rate: 2,
        last_reinforced: hours_ago(1),
        current_strength: 98,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },
      {
        category: 'fact',
        name: 'MCP-B',
        description: 'MCP-B is the reference implementation of WebMCP, providing a polyfill for navigator.modelContext and bridging WebMCP with MCP. It includes a Chrome extension with Char (in-page agent) and specialized AI agents for building userscripts, creating WebMCP tools, and browsing websites.',
        tags: ['mcp-b', 'webmcp', 'extension', 'polyfill', 'char'],
        confidence: 100,
        source_type: 'manual',
        source_session_id: session1.id,
        mention_count: 18,
        last_mentioned: hours_ago(1),
        importance_score: 95,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 32,
        last_accessed: hours_ago(1),
        promotion_score: 94,
        decay_rate: 2,
        last_reinforced: hours_ago(1),
        current_strength: 97,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },

      // TECHNOLOGY COMPONENTS
      {
        category: 'fact',
        name: 'Web Workers',
        description: 'Web Workers enable JavaScript to run in background threads, isolated from the main browser thread. WebMCP uses Web Workers to host MCP servers in the browser, allowing concurrent tool execution without blocking the UI.',
        tags: ['web-workers', 'browser-api', 'concurrency', 'webmcp'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session3.id,
        mention_count: 8,
        last_mentioned: days_ago(2),
        importance_score: 85,
        memory_tier: 'working',
        memory_type: 'semantic',
        access_count: 18,
        last_accessed: days_ago(2),
        promotion_score: 82,
        decay_rate: 5,
        last_reinforced: days_ago(2),
        current_strength: 90,
        created_at: days_ago(5),
        updated_at: days_ago(2),
      },
      {
        category: 'fact',
        name: 'PG-Lite',
        description: 'PG-Lite is PostgreSQL compiled to WebAssembly (WASM), running entirely in the browser with IndexedDB persistence. It provides full SQL capabilities client-side, making it perfect for WebMCP-based database tools.',
        tags: ['pglite', 'postgresql', 'wasm', 'database'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session2.id,
        mention_count: 10,
        last_mentioned: hours_ago(3),
        importance_score: 88,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 22,
        last_accessed: hours_ago(3),
        promotion_score: 85,
        decay_rate: 4,
        last_reinforced: hours_ago(3),
        current_strength: 92,
        created_at: days_ago(5),
        updated_at: hours_ago(3),
      },
      {
        category: 'fact',
        name: 'Drizzle ORM',
        description: 'Drizzle is a lightweight TypeScript ORM with excellent type inference and SQL-like syntax. Used in WebMCP applications for type-safe database queries against PG-Lite, providing better DX than raw SQL while maintaining performance.',
        tags: ['drizzle', 'orm', 'typescript', 'type-safety'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session2.id,
        mention_count: 7,
        last_mentioned: days_ago(2),
        importance_score: 75,
        memory_tier: 'working',
        memory_type: 'semantic',
        access_count: 15,
        last_accessed: days_ago(2),
        promotion_score: 72,
        decay_rate: 8,
        last_reinforced: days_ago(2),
        current_strength: 85,
        created_at: days_ago(3),
        updated_at: days_ago(2),
      },

      // ARCHITECTURAL CONCEPTS
      {
        category: 'context',
        name: 'WebMCP vs Traditional MCP',
        description: 'Traditional MCP requires Node.js servers running locally or remotely. WebMCP eliminates this by running MCP servers in browser Web Workers. Trade-offs: WebMCP has browser security restrictions but gains zero-infrastructure deployment and offline capabilities.',
        tags: ['webmcp', 'mcp', 'architecture', 'comparison'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session3.id,
        mention_count: 6,
        last_mentioned: days_ago(2),
        importance_score: 90,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 14,
        last_accessed: days_ago(2),
        promotion_score: 88,
        decay_rate: 4,
        last_reinforced: days_ago(2),
        current_strength: 94,
        created_at: days_ago(2),
        updated_at: days_ago(2),
      },
      {
        category: 'fact',
        name: 'Zero-Infrastructure Architecture',
        description: 'WebMCP enables "zero-infrastructure" AI applications that run entirely in the browser. No servers to deploy, no databases to host, no backend to maintain. Everything runs client-side with browser persistence (IndexedDB, localStorage).',
        tags: ['architecture', 'webmcp', 'serverless', 'browser'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session1.id,
        mention_count: 9,
        last_mentioned: days_ago(1),
        importance_score: 87,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 20,
        last_accessed: days_ago(1),
        promotion_score: 85,
        decay_rate: 4,
        last_reinforced: days_ago(1),
        current_strength: 92,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },

      // PEOPLE & CONTRIBUTORS
      {
        category: 'person',
        name: 'Brandon Walderman',
        description: 'Creator of WebMCP. Built the browser-based implementation of Model Context Protocol, enabling MCP servers to run in Web Workers without Node.js dependencies.',
        tags: ['webmcp', 'creator', 'contributor', 'developer'],
        confidence: 100,
        source_type: 'manual',
        mention_count: 5,
        last_mentioned: days_ago(3),
        importance_score: 85,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 12,
        last_accessed: days_ago(3),
        promotion_score: 80,
        decay_rate: 6,
        last_reinforced: days_ago(3),
        current_strength: 90,
        created_at: days_ago(7),
        updated_at: days_ago(3),
      },
      {
        category: 'person',
        name: 'Alex Nahas',
        description: 'Creator of MCP-B, the reference implementation of WebMCP. MCP-B provides the navigator.modelContext polyfill and Char, the in-page AI agent. Alex is a key contributor to the W3C WebMCP standard incubation within the Web Machine Learning Community Group.',
        tags: ['mcp-b', 'creator', 'webmcp', 'developer', 'char'],
        confidence: 100,
        source_type: 'manual',
        mention_count: 8,
        last_mentioned: hours_ago(2),
        importance_score: 90,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 15,
        last_accessed: hours_ago(2),
        promotion_score: 88,
        decay_rate: 3,
        last_reinforced: hours_ago(2),
        current_strength: 95,
        created_at: days_ago(7),
        updated_at: hours_ago(2),
      },

      // USE CASES & APPLICATIONS
      {
        category: 'context',
        name: 'WebMCP Use Cases',
        description: 'WebMCP enables: (1) Offline AI applications with local data persistence, (2) Privacy-focused tools where data never leaves the browser, (3) Rapid prototyping without backend setup, (4) Educational demos showcasing AI capabilities, (5) Browser extensions with AI features.',
        tags: ['use-cases', 'webmcp', 'applications', 'examples'],
        confidence: 95,
        source_type: 'conversation',
        source_session_id: session1.id,
        mention_count: 7,
        last_mentioned: days_ago(1),
        importance_score: 82,
        memory_tier: 'working',
        memory_type: 'semantic',
        access_count: 16,
        last_accessed: days_ago(1),
        promotion_score: 78,
        decay_rate: 6,
        last_reinforced: days_ago(1),
        current_strength: 88,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },
      {
        category: 'project',
        name: 'WebMCP Memory Playground',
        description: 'Example WebMCP application demonstrating AI agent memory using PG-Lite and Drizzle ORM. Shows how agents can store and retrieve structured memories through MCP tools, all running in the browser.',
        tags: ['webmcp', 'example', 'memory', 'playground'],
        confidence: 100,
        source_type: 'system',
        mention_count: 20,
        last_mentioned: hours_ago(1),
        importance_score: 95,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 40,
        last_accessed: hours_ago(1),
        promotion_score: 95,
        decay_rate: 2,
        last_reinforced: hours_ago(1),
        current_strength: 98,
        created_at: days_ago(7),
        updated_at: hours_ago(1),
      },

      // TECHNICAL BENEFITS
      {
        category: 'fact',
        name: 'WebMCP Security Model',
        description: 'WebMCP inherits browser security restrictions: same-origin policy, CORS, no filesystem access. This limits some capabilities but provides strong security boundaries. Perfect for untrusted environments where server-side MCP would be risky.',
        tags: ['security', 'webmcp', 'browser', 'limitations'],
        confidence: 95,
        source_type: 'conversation',
        source_session_id: session3.id,
        mention_count: 5,
        last_mentioned: days_ago(2),
        importance_score: 78,
        memory_tier: 'working',
        memory_type: 'semantic',
        access_count: 11,
        last_accessed: days_ago(2),
        promotion_score: 72,
        decay_rate: 8,
        last_reinforced: days_ago(2),
        current_strength: 84,
        created_at: days_ago(2),
        updated_at: days_ago(2),
      },
      {
        category: 'preference',
        name: 'Browser-First Development',
        description: 'Preference for building AI applications that run in the browser first, using technologies like WebMCP, WASM, and client-side databases. Values privacy, offline capability, and zero deployment complexity.',
        tags: ['preference', 'browser', 'webmcp', 'philosophy'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session1.id,
        mention_count: 8,
        last_mentioned: days_ago(1),
        importance_score: 85,
        memory_tier: 'long_term',
        memory_type: 'semantic',
        access_count: 18,
        last_accessed: days_ago(1),
        promotion_score: 83,
        decay_rate: 4,
        last_reinforced: days_ago(1),
        current_strength: 92,
        created_at: days_ago(5),
        updated_at: days_ago(1),
      },

      // LEARNING RESOURCES
      {
        category: 'context',
        name: 'MCP Tool Schema Pattern',
        description: 'MCP tools follow a standard pattern: (1) Define JSON schema with name, description, inputSchema, (2) Implement handler function, (3) Register tool with MCP server, (4) AI agent discovers and invokes via protocol. WebMCP uses the same pattern in Web Workers.',
        tags: ['mcp', 'pattern', 'tools', 'schema'],
        confidence: 100,
        source_type: 'conversation',
        source_session_id: session2.id,
        mention_count: 6,
        last_mentioned: hours_ago(2),
        importance_score: 80,
        memory_tier: 'working',
        memory_type: 'semantic',
        access_count: 14,
        last_accessed: hours_ago(2),
        promotion_score: 76,
        decay_rate: 7,
        last_reinforced: hours_ago(2),
        current_strength: 86,
        created_at: days_ago(3),
        updated_at: hours_ago(2),
      },
    ]).returning();

    // Map entities by name for easy reference
    const entityMap: Record<string, typeof entities[0]> = {};
    entities.forEach(e => {
      entityMap[e.name] = e;
    });

    // ========================================
    // ENTITY RELATIONSHIPS - Knowledge graph
    // ========================================
    await db.insert(schema.entity_relationships).values([
      // WebMCP implements MCP
      {
        from_entity_id: entityMap['WebMCP'].id,
        to_entity_id: entityMap['Model Context Protocol'].id,
        relationship_type: 'implements',
        description: 'WebMCP is a browser-based implementation of the MCP protocol',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // WebMCP uses Web Workers
      {
        from_entity_id: entityMap['WebMCP'].id,
        to_entity_id: entityMap['Web Workers'].id,
        relationship_type: 'uses',
        description: 'WebMCP runs MCP servers in Web Workers for concurrent execution',
        strength: 10,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // WebMCP enables In-Page AI Agents
      {
        from_entity_id: entityMap['WebMCP'].id,
        to_entity_id: entityMap['In-Page AI Agents'].id,
        relationship_type: 'enables',
        description: 'WebMCP enables in-page AI agents like Char to interact with websites',
        strength: 10,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // MCP defines Tools
      {
        from_entity_id: entityMap['Model Context Protocol'].id,
        to_entity_id: entityMap['MCP Tools'].id,
        relationship_type: 'defines',
        description: 'MCP protocol specifies how tools are structured and invoked',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // In-Page AI Agents use MCP Tools
      {
        from_entity_id: entityMap['In-Page AI Agents'].id,
        to_entity_id: entityMap['MCP Tools'].id,
        relationship_type: 'invokes',
        description: 'In-page AI agents like Char discover and invoke MCP tools to perform actions',
        strength: 9,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // Brandon created WebMCP
      {
        from_entity_id: entityMap['Brandon Walderman'].id,
        to_entity_id: entityMap['WebMCP'].id,
        relationship_type: 'created',
        description: 'Brandon Walderman is the creator of WebMCP',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // Alex created MCP-B
      {
        from_entity_id: entityMap['Alex Nahas'].id,
        to_entity_id: entityMap['MCP-B'].id,
        relationship_type: 'created',
        description: 'Alex Nahas created MCP-B, the reference implementation of WebMCP',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // MCP-B implements WebMCP
      {
        from_entity_id: entityMap['MCP-B'].id,
        to_entity_id: entityMap['WebMCP'].id,
        relationship_type: 'implements',
        description: 'MCP-B is the reference implementation that polyfills navigator.modelContext for WebMCP',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // Char is part of MCP-B
      {
        from_entity_id: entityMap['Char'].id,
        to_entity_id: entityMap['MCP-B'].id,
        relationship_type: 'component_of',
        description: 'Char is the primary in-page AI agent provided by MCP-B',
        strength: 10,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // Char uses WebMCP
      {
        from_entity_id: entityMap['Char'].id,
        to_entity_id: entityMap['WebMCP'].id,
        relationship_type: 'uses',
        description: 'Char interacts with websites through the WebMCP navigator.modelContext API',
        strength: 10,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // Memory Playground uses WebMCP
      {
        from_entity_id: entityMap['WebMCP Memory Playground'].id,
        to_entity_id: entityMap['WebMCP'].id,
        relationship_type: 'demonstrates',
        description: 'This playground application demonstrates WebMCP capabilities',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // Memory Playground uses PG-Lite
      {
        from_entity_id: entityMap['WebMCP Memory Playground'].id,
        to_entity_id: entityMap['PG-Lite'].id,
        relationship_type: 'uses',
        description: 'The playground uses PG-Lite for browser-based SQL database',
        strength: 10,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // Memory Playground uses Drizzle
      {
        from_entity_id: entityMap['WebMCP Memory Playground'].id,
        to_entity_id: entityMap['Drizzle ORM'].id,
        relationship_type: 'uses',
        description: 'The playground uses Drizzle for type-safe database queries',
        strength: 9,
        created_at: days_ago(7),
        updated_at: days_ago(7),
      },
      // WebMCP vs Traditional MCP comparison
      {
        from_entity_id: entityMap['WebMCP vs Traditional MCP'].id,
        to_entity_id: entityMap['WebMCP'].id,
        relationship_type: 'compares',
        description: 'Explains how WebMCP differs from server-based MCP',
        strength: 9,
        created_at: days_ago(2),
        updated_at: days_ago(2),
      },
      // Zero-Infrastructure enabled by WebMCP
      {
        from_entity_id: entityMap['WebMCP'].id,
        to_entity_id: entityMap['Zero-Infrastructure Architecture'].id,
        relationship_type: 'enables',
        description: 'WebMCP enables applications with zero backend infrastructure',
        strength: 10,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // Use Cases enabled by WebMCP
      {
        from_entity_id: entityMap['WebMCP'].id,
        to_entity_id: entityMap['WebMCP Use Cases'].id,
        relationship_type: 'enables',
        description: 'WebMCP makes various offline and privacy-focused use cases possible',
        strength: 9,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
      // Security Model of WebMCP
      {
        from_entity_id: entityMap['WebMCP'].id,
        to_entity_id: entityMap['WebMCP Security Model'].id,
        relationship_type: 'has_property',
        description: 'WebMCP inherits browser security constraints and benefits',
        strength: 8,
        created_at: days_ago(2),
        updated_at: days_ago(2),
      },
      // Tool Schema Pattern used by MCP
      {
        from_entity_id: entityMap['MCP Tools'].id,
        to_entity_id: entityMap['MCP Tool Schema Pattern'].id,
        relationship_type: 'follows',
        description: 'MCP tools follow a standardized schema and registration pattern',
        strength: 9,
        created_at: days_ago(3),
        updated_at: days_ago(3),
      },
      // Browser-First philosophy related to WebMCP
      {
        from_entity_id: entityMap['Browser-First Development'].id,
        to_entity_id: entityMap['WebMCP'].id,
        relationship_type: 'motivated_by',
        description: 'WebMCP aligns with browser-first development philosophy',
        strength: 9,
        created_at: days_ago(5),
        updated_at: days_ago(5),
      },
    ]);

    // ========================================
    // CONVERSATION MESSAGES (sample)
    // ========================================
    const messages = await db.insert(schema.conversation_messages).values([
      {
        session_id: session1.id,
        role: 'user',
        content: 'What is WebMCP and how is it becoming a W3C standard?',
        token_count: 18,
        created_at: days_ago(5),
      },
      {
        session_id: session1.id,
        role: 'assistant',
        content: 'WebMCP is a W3C web standard being incubated by the Web Machine Learning Community Group. It enables websites to expose AI-callable tools through navigator.modelContext, allowing in-page agents like Char to interact with web applications directly. MCP-B provides the reference implementation and polyfill.',
        token_count: 58,
        created_at: days_ago(5),
      },
      {
        session_id: session1.id,
        role: 'user',
        content: 'What is Char and how does it work with WebMCP?',
        token_count: 15,
        created_at: days_ago(5),
      },
      {
        session_id: session1.id,
        role: 'assistant',
        content: 'Char is MCP-B\'s primary in-page AI agent. It operates through the navigator.modelContext API to invoke tools on WebMCP-enabled websites. The key advantage is human-in-the-loop oversight - users can see exactly what the agent is doing since it works within the visible web page context.',
        token_count: 68,
        created_at: days_ago(5),
      },
      {
        session_id: session2.id,
        role: 'user',
        content: 'How do I create a WebMCP tool that Char can use?',
        token_count: 16,
        created_at: days_ago(3),
      },
      {
        session_id: session2.id,
        role: 'assistant',
        content: 'To create a WebMCP tool: (1) Use navigator.modelContext.registerTool() with a name, description, and input schema, (2) Implement your handler function, (3) The tool becomes available to Char and other in-page agents automatically. MCP-B\'s polyfill handles the protocol communication.',
        token_count: 72,
        created_at: days_ago(3),
      },
      {
        session_id: session2.id,
        role: 'user',
        content: 'Can you show me an example of using PGlite with WebMCP?',
        token_count: 16,
        created_at: days_ago(3),
      },
      {
        session_id: session2.id,
        role: 'assistant',
        content: 'This playground app is a perfect example! It uses PGlite (PostgreSQL compiled to WebAssembly) as a browser-based database. Char can invoke WebMCP tools to query and modify the database - all running client-side with human-in-the-loop oversight. No backend needed!',
        token_count: 58,
        created_at: days_ago(3),
      },
      {
        session_id: session3.id,
        role: 'user',
        content: 'What specialized agents does MCP-B provide besides Char?',
        token_count: 14,
        created_at: days_ago(2),
      },
      {
        session_id: session3.id,
        role: 'assistant',
        content: 'MCP-B includes four specialized agents: (1) Char - the main in-page agent for WebMCP websites, (2) Userscript Engineer - creates custom scripts for website modification, (3) WebMCP Server - builds tools that expose website features, (4) Browsing Agent - explores and extracts information, (5) Chat Companion - conversational assistant without automation.',
        token_count: 72,
        created_at: days_ago(2),
      },
    ]).returning();

    // ========================================
    // ENTITY MENTIONS - Track entity references
    // ========================================
    await db.insert(schema.entity_mentions).values([
      {
        entity_id: entityMap['WebMCP'].id,
        message_id: messages[0].id,
        session_id: session1.id,
        mention_context: 'What is WebMCP and how is it becoming a W3C standard',
        created_at: days_ago(5),
      },
      {
        entity_id: entityMap['MCP-B'].id,
        message_id: messages[1].id,
        session_id: session1.id,
        mention_context: 'MCP-B provides the reference implementation and polyfill',
        created_at: days_ago(5),
      },
      {
        entity_id: entityMap['Char'].id,
        message_id: messages[1].id,
        session_id: session1.id,
        mention_context: 'allowing in-page agents like Char to interact',
        created_at: days_ago(5),
      },
      {
        entity_id: entityMap['Char'].id,
        message_id: messages[3].id,
        session_id: session1.id,
        mention_context: 'Char is MCP-B\'s primary in-page AI agent',
        created_at: days_ago(5),
      },
      {
        entity_id: entityMap['MCP Tools'].id,
        message_id: messages[4].id,
        session_id: session2.id,
        mention_context: 'How do I create a WebMCP tool that Char can use',
        created_at: days_ago(3),
      },
      {
        entity_id: entityMap['MCP Tool Schema Pattern'].id,
        message_id: messages[5].id,
        session_id: session2.id,
        mention_context: 'navigator.modelContext.registerTool() with a name, description',
        created_at: days_ago(3),
      },
      {
        entity_id: entityMap['PG-Lite'].id,
        message_id: messages[6].id,
        session_id: session2.id,
        mention_context: 'using PGlite with WebMCP',
        created_at: days_ago(3),
      },
      {
        entity_id: entityMap['WebMCP Memory Playground'].id,
        message_id: messages[7].id,
        session_id: session2.id,
        mention_context: 'This playground app is a perfect example',
        created_at: days_ago(3),
      },
      {
        entity_id: entityMap['In-Page AI Agents'].id,
        message_id: messages[8].id,
        session_id: session3.id,
        mention_context: 'What specialized agents does MCP-B provide besides Char',
        created_at: days_ago(2),
      },
      {
        entity_id: entityMap['MCP-B'].id,
        message_id: messages[9].id,
        session_id: session3.id,
        mention_context: 'MCP-B includes four specialized agents',
        created_at: days_ago(2),
      },
    ]);

    // ========================================
    // ENTITY CONTEXTS - Assign entities to contexts
    // ========================================
    await db.insert(schema.entity_contexts).values([
      // WebMCP Standard
      { entity_id: entityMap['WebMCP'].id, context_id: contextMap['webmcp_standard'].id, relevance_score: 100 },
      { entity_id: entityMap['Zero-Infrastructure Architecture'].id, context_id: contextMap['webmcp_standard'].id, relevance_score: 90 },
      { entity_id: entityMap['WebMCP Use Cases'].id, context_id: contextMap['webmcp_standard'].id, relevance_score: 88 },
      { entity_id: entityMap['WebMCP vs Traditional MCP'].id, context_id: contextMap['webmcp_standard'].id, relevance_score: 92 },
      { entity_id: entityMap['WebMCP Security Model'].id, context_id: contextMap['webmcp_standard'].id, relevance_score: 85 },

      // MCP Protocol
      { entity_id: entityMap['Model Context Protocol'].id, context_id: contextMap['mcp_protocol'].id, relevance_score: 100 },
      { entity_id: entityMap['MCP Tools'].id, context_id: contextMap['mcp_protocol'].id, relevance_score: 95 },
      { entity_id: entityMap['MCP Tool Schema Pattern'].id, context_id: contextMap['mcp_protocol'].id, relevance_score: 90 },

      // Browser Technologies
      { entity_id: entityMap['Web Workers'].id, context_id: contextMap['browser_technologies'].id, relevance_score: 95 },
      { entity_id: entityMap['PG-Lite'].id, context_id: contextMap['browser_technologies'].id, relevance_score: 90 },
      { entity_id: entityMap['Drizzle ORM'].id, context_id: contextMap['browser_technologies'].id, relevance_score: 85 },

      // In-Page Agents (Char)
      { entity_id: entityMap['Char'].id, context_id: contextMap['in_page_agents'].id, relevance_score: 100 },
      { entity_id: entityMap['In-Page AI Agents'].id, context_id: contextMap['in_page_agents'].id, relevance_score: 95 },
      { entity_id: entityMap['MCP Tools'].id, context_id: contextMap['in_page_agents'].id, relevance_score: 90 },
      { entity_id: entityMap['WebMCP Memory Playground'].id, context_id: contextMap['in_page_agents'].id, relevance_score: 92 },

      // MCP-B Ecosystem
      { entity_id: entityMap['MCP-B'].id, context_id: contextMap['mcp_b_ecosystem'].id, relevance_score: 100 },
      { entity_id: entityMap['Char'].id, context_id: contextMap['mcp_b_ecosystem'].id, relevance_score: 95 },
      { entity_id: entityMap['Alex Nahas'].id, context_id: contextMap['mcp_b_ecosystem'].id, relevance_score: 95 },

      // Cross-context entities
      { entity_id: entityMap['WebMCP'].id, context_id: contextMap['in_page_agents'].id, relevance_score: 95 },
      { entity_id: entityMap['Browser-First Development'].id, context_id: contextMap['webmcp_standard'].id, relevance_score: 85 },
    ]);

    // ========================================
    // MEMORY TRIGGERS - Associative memory
    // ========================================
    await db.insert(schema.memory_triggers).values([
      // WebMCP keywords
      { entity_id: entityMap['WebMCP'].id, trigger_type: 'keyword', trigger_value: 'webmcp', strength: 100 },
      { entity_id: entityMap['WebMCP'].id, trigger_type: 'keyword', trigger_value: 'web mcp', strength: 95 },
      { entity_id: entityMap['WebMCP'].id, trigger_type: 'keyword', trigger_value: 'browser mcp', strength: 90 },
      { entity_id: entityMap['WebMCP'].id, trigger_type: 'keyword', trigger_value: 'browser-based', strength: 85 },

      // MCP keywords
      { entity_id: entityMap['Model Context Protocol'].id, trigger_type: 'keyword', trigger_value: 'mcp', strength: 100 },
      { entity_id: entityMap['Model Context Protocol'].id, trigger_type: 'keyword', trigger_value: 'model context protocol', strength: 95 },
      { entity_id: entityMap['Model Context Protocol'].id, trigger_type: 'keyword', trigger_value: 'anthropic', strength: 85 },

      // Tools keywords
      { entity_id: entityMap['MCP Tools'].id, trigger_type: 'keyword', trigger_value: 'tools', strength: 90 },
      { entity_id: entityMap['MCP Tools'].id, trigger_type: 'keyword', trigger_value: 'mcp tools', strength: 95 },
      { entity_id: entityMap['MCP Tools'].id, trigger_type: 'keyword', trigger_value: 'tool schema', strength: 85 },

      // AI agents keywords
      { entity_id: entityMap['In-Page AI Agents'].id, trigger_type: 'keyword', trigger_value: 'ai agent', strength: 95 },
      { entity_id: entityMap['In-Page AI Agents'].id, trigger_type: 'keyword', trigger_value: 'agent', strength: 85 },
      { entity_id: entityMap['In-Page AI Agents'].id, trigger_type: 'keyword', trigger_value: 'browser agent', strength: 90 },

      // Technology keywords
      { entity_id: entityMap['Web Workers'].id, trigger_type: 'keyword', trigger_value: 'web worker', strength: 95 },
      { entity_id: entityMap['Web Workers'].id, trigger_type: 'keyword', trigger_value: 'worker thread', strength: 85 },
      { entity_id: entityMap['PG-Lite'].id, trigger_type: 'keyword', trigger_value: 'pglite', strength: 100 },
      { entity_id: entityMap['PG-Lite'].id, trigger_type: 'keyword', trigger_value: 'postgres', strength: 80 },
      { entity_id: entityMap['PG-Lite'].id, trigger_type: 'keyword', trigger_value: 'wasm', strength: 75 },

      // Architecture keywords
      { entity_id: entityMap['Zero-Infrastructure Architecture'].id, trigger_type: 'keyword', trigger_value: 'zero infrastructure', strength: 95 },
      { entity_id: entityMap['Zero-Infrastructure Architecture'].id, trigger_type: 'keyword', trigger_value: 'serverless', strength: 85 },
      { entity_id: entityMap['Zero-Infrastructure Architecture'].id, trigger_type: 'keyword', trigger_value: 'no backend', strength: 90 },

      // People keywords
      { entity_id: entityMap['Brandon Walderman'].id, trigger_type: 'keyword', trigger_value: 'brandon', strength: 95 },
      { entity_id: entityMap['Alex Nahas'].id, trigger_type: 'keyword', trigger_value: 'alex', strength: 90 },
      { entity_id: entityMap['Alex Nahas'].id, trigger_type: 'keyword', trigger_value: 'mcp-b', strength: 95 },

      // Char and in-page agent keywords
      { entity_id: entityMap['Char'].id, trigger_type: 'keyword', trigger_value: 'char', strength: 100 },
      { entity_id: entityMap['Char'].id, trigger_type: 'keyword', trigger_value: 'in-page agent', strength: 95 },
      { entity_id: entityMap['Char'].id, trigger_type: 'keyword', trigger_value: 'in page agent', strength: 95 },
      { entity_id: entityMap['In-Page AI Agents'].id, trigger_type: 'keyword', trigger_value: 'in-page', strength: 95 },
      { entity_id: entityMap['MCP-B'].id, trigger_type: 'keyword', trigger_value: 'mcp-b', strength: 100 },
      { entity_id: entityMap['MCP-B'].id, trigger_type: 'keyword', trigger_value: 'mcpb', strength: 90 },
      { entity_id: entityMap['MCP-B'].id, trigger_type: 'keyword', trigger_value: 'polyfill', strength: 85 },

      // Context triggers
      { entity_id: entityMap['WebMCP'].id, trigger_type: 'context', trigger_value: 'webmcp_standard', strength: 95 },
      { entity_id: entityMap['Model Context Protocol'].id, trigger_type: 'context', trigger_value: 'mcp_protocol', strength: 95 },
      { entity_id: entityMap['Char'].id, trigger_type: 'context', trigger_value: 'in_page_agents', strength: 95 },
      { entity_id: entityMap['In-Page AI Agents'].id, trigger_type: 'context', trigger_value: 'in_page_agents', strength: 90 },
      { entity_id: entityMap['MCP-B'].id, trigger_type: 'context', trigger_value: 'mcp_b_ecosystem', strength: 95 },
    ]);

    // ========================================
    // MEMORY EPISODES - Episodic memories
    // ========================================
    await db.insert(schema.memory_episodes).values([
      {
        session_id: session1.id,
        event_type: 'conversation',
        content: 'User asked about WebMCP as a W3C standard and its relationship to MCP-B',
        related_entity_ids: [entityMap['WebMCP'].id, entityMap['MCP-B'].id, entityMap['Model Context Protocol'].id],
        temporal_order: 1,
        emotional_context: 'positive',
        created_at: days_ago(5),
      },
      {
        session_id: session1.id,
        event_type: 'learning',
        content: 'Explained that WebMCP is incubated by W3C Web Machine Learning CG, with MCP-B as reference implementation',
        related_entity_ids: [entityMap['WebMCP'].id, entityMap['MCP-B'].id, entityMap['Char'].id],
        temporal_order: 2,
        emotional_context: 'positive',
        created_at: days_ago(5),
      },
      {
        session_id: session1.id,
        event_type: 'observation',
        content: 'User interested in Char as the primary in-page agent and human-in-the-loop oversight',
        related_entity_ids: [entityMap['Char'].id, entityMap['In-Page AI Agents'].id],
        temporal_order: 3,
        emotional_context: 'positive',
        created_at: days_ago(5),
      },
      {
        session_id: session2.id,
        event_type: 'conversation',
        content: 'User wanted to learn how to create WebMCP tools that Char can invoke',
        related_entity_ids: [entityMap['MCP Tools'].id, entityMap['Char'].id, entityMap['MCP Tool Schema Pattern'].id],
        temporal_order: 1,
        emotional_context: 'positive',
        created_at: days_ago(3),
      },
      {
        session_id: session2.id,
        event_type: 'learning',
        content: 'Explained navigator.modelContext.registerTool() pattern for tool registration',
        related_entity_ids: [entityMap['MCP Tool Schema Pattern'].id, entityMap['MCP Tools'].id, entityMap['WebMCP'].id],
        temporal_order: 2,
        emotional_context: 'neutral',
        created_at: days_ago(3),
      },
      {
        session_id: session2.id,
        event_type: 'action',
        content: 'Demonstrated PGlite integration in the playground with Char invocation',
        related_entity_ids: [entityMap['PG-Lite'].id, entityMap['WebMCP Memory Playground'].id, entityMap['Char'].id],
        temporal_order: 3,
        emotional_context: 'positive',
        created_at: days_ago(3),
      },
      {
        session_id: session3.id,
        event_type: 'conversation',
        content: 'Discussion about MCP-B specialized agents including Char, Userscript Engineer, and others',
        related_entity_ids: [entityMap['MCP-B'].id, entityMap['Char'].id, entityMap['In-Page AI Agents'].id],
        temporal_order: 1,
        emotional_context: 'neutral',
        created_at: days_ago(2),
      },
      {
        session_id: session3.id,
        event_type: 'learning',
        content: 'Explained the four MCP-B agents: Char, Userscript Engineer, WebMCP Server, Browsing Agent, Chat Companion',
        related_entity_ids: [entityMap['MCP-B'].id, entityMap['In-Page AI Agents'].id, entityMap['Char'].id],
        temporal_order: 2,
        emotional_context: 'neutral',
        created_at: days_ago(2),
      },
    ]);

    // Database seeded successfully - educational WebMCP content created
  } catch (error) {
    console.error('[DB Seed] Error seeding database:', error);
    throw error;
  }
}
