# WebMCP Memory Usage Examples

This document shows how external agents (Chrome extensions, Claude Desktop, etc.) use WebMCP memory tools in practice.

---

## 🎬 Scenario 1: Personal Assistant - First Conversation

**User**: "Hi, I'm Alex. I'm a software engineer working on WebMCP. I love TypeScript and React."

**Agent Workflow**:

```javascript
// 1. Save the conversation
await mcp.callTool('conversation_save', {
  role: 'user',
  content: "Hi, I'm Alex. I'm a software engineer working on WebMCP. I love TypeScript and React.",
  session_id: 'session-123'
});

// 2. Extract entities from the message
await mcp.callTool('memory_entity_store', {
  category: 'person',
  name: 'Alex',
  description: 'User identity - software engineer working on WebMCP',
  confidence: 100
});

await mcp.callTool('memory_entity_store', {
  category: 'project',
  name: 'WebMCP',
  description: 'Current project - browser-based MCP implementation',
  confidence: 100
});

await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'TypeScript',
  description: 'User loves TypeScript programming language',
  confidence: 95
});

await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'React',
  description: 'User loves React framework',
  confidence: 95
});

// 3. Create relationships
const alexId = '...'; // From first entity
const webmcpId = '...'; // From second entity
const tsId = '...'; // TypeScript
const reactId = '...'; // React

await mcp.callTool('memory_relationship_create', {
  from_entity_id: alexId,
  to_entity_id: webmcpId,
  relationship_type: 'works_on',
  strength: 10
});

await mcp.callTool('memory_relationship_create', {
  from_entity_id: alexId,
  to_entity_id: tsId,
  relationship_type: 'prefers',
  strength: 9
});

await mcp.callTool('memory_relationship_create', {
  from_entity_id: webmcpId,
  to_entity_id: reactId,
  relationship_type: 'uses',
  strength: 8
});

// 4. Promote to working memory (conscious mode)
await mcp.callTool('working_memory_promote', {
  entity_id: alexId,
  promotion_reason: 'user_identity',
  priority: 100,
  expires_hours: 24
});

await mcp.callTool('working_memory_promote', {
  entity_id: webmcpId,
  promotion_reason: 'current_project',
  priority: 90,
  expires_hours: 24
});

// 5. Update core memory block
await mcp.callTool('memory_block_update', {
  block_type: 'user_profile',
  value: 'Name: Alex | Role: Software Engineer | Current Project: WebMCP | Loves: TypeScript, React'
});
```

**Agent Response**: "Nice to meet you, Alex! I've noted that you're a software engineer working on WebMCP, and you love TypeScript and React. I'll remember this for our future conversations."

---

## 🎬 Scenario 2: Returning User - Context Retrieval

**User** (next day): "Can you help me debug a React hook issue?"

**Agent Workflow**:

```javascript
// 1. Smart retrieval - what does agent need to know?
const context = await mcp.callTool('memory_smart_retrieve', {
  query: 'Can you help me debug a React hook issue?',
  mode: 'hybrid',
  max_results: 5
});

// Returns:
// {
//   working_memory: [
//     { category: 'person', name: 'Alex', description: 'User identity - software engineer' },
//     { category: 'project', name: 'WebMCP', description: 'Current project' }
//   ],
//   retrieved_entities: [
//     { category: 'preference', name: 'React', description: 'User loves React', relevance_score: 0.98 },
//     { category: 'preference', name: 'TypeScript', description: 'User loves TypeScript', relevance_score: 0.75 }
//   ],
//   context_summary: 'Retrieved 4 memories: user identity, current project, React & TypeScript preferences'
// }

// 2. Agent uses this context to personalize response
// Agent knows:
// - User is Alex, a software engineer
// - Working on WebMCP
// - Loves React and TypeScript
// - Therefore: provide TypeScript-specific React advice

// 3. Save new conversation
await mcp.callTool('conversation_save', {
  role: 'user',
  content: 'Can you help me debug a React hook issue?',
  session_id: 'session-456'
});

// 4. Update mention counts
await mcp.callTool('memory_entity_update', {
  entity_id: reactId,
  // Backend automatically increments mention_count and updates last_mentioned
});
```

**Agent Response**: "Of course, Alex! I know you're working with React and TypeScript on WebMCP. What's the hook issue you're facing?"

---

## 🎬 Scenario 3: Travel Planning - Building Complex Memory

**User**: "I want to plan a trip to Japan. I love sushi and temples. My budget is $3000."

**Agent Workflow**:

```javascript
// 1. Store trip goal
const tripGoal = await mcp.callTool('memory_entity_store', {
  category: 'goal',
  name: 'Japan trip',
  description: 'User wants to travel to Japan. Interests: sushi, temples. Budget: $3000',
  confidence: 100
});

// 2. Store preferences
const sushiPref = await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'Sushi',
  description: 'User loves sushi',
  confidence: 100
});

const templePref = await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'Temples',
  description: 'User loves temples',
  confidence: 100
});

// 3. Create relationships
await mcp.callTool('memory_relationship_create', {
  from_entity_id: tripGoal.entity_id,
  to_entity_id: sushiPref.entity_id,
  relationship_type: 'includes_interest',
  strength: 8
});

await mcp.callTool('memory_relationship_create', {
  from_entity_id: tripGoal.entity_id,
  to_entity_id: templePref.entity_id,
  relationship_type: 'includes_interest',
  strength: 8
});

// 4. Store budget as a rule
await mcp.callTool('memory_entity_store', {
  category: 'rule',
  name: 'Japan trip budget',
  description: 'Budget constraint: $3000 max for Japan trip',
  confidence: 100
});

// 5. Promote to working memory (this is current focus)
await mcp.callTool('working_memory_promote', {
  entity_id: tripGoal.entity_id,
  promotion_reason: 'current_goal',
  priority: 100,
  expires_hours: 72 // Keep for 3 days while planning
});
```

**Later** (user continues): "What are some good areas to stay in Tokyo?"

```javascript
// Agent retrieves:
const context = await mcp.callTool('memory_smart_retrieve', {
  query: 'What are some good areas to stay in Tokyo?',
  mode: 'hybrid',
  max_results: 5
});

// Context includes:
// - Japan trip goal (from working memory)
// - Sushi preference (related to trip via relationship)
// - Temple preference (related to trip)
// - Budget rule ($3000 constraint)

// Agent finds related entities via graph traversal:
const related = await mcp.callTool('memory_relationship_find', {
  entity_id: tripGoal.entity_id
});

// Returns all connected entities: sushi, temples, budget
```

**Agent Response**: "For your Japan trip, I'd suggest staying in Asakusa (near temples like Sensō-ji) or Tsukiji area (near the fish market for amazing sushi). Both fit your $3000 budget if you book mid-range hotels."

---

## 🎬 Scenario 4: Conversation Eviction & Summarization

**Scenario**: Agent has been chatting for 50 messages, context window filling up.

```javascript
// 1. Check if context window is near limit
const stats = await mcp.callTool('memory_stats');
// { conversation_messages_count: 50, ... }

// 2. Get oldest messages
const oldMessages = await mcp.callTool('conversation_get_recent', {
  session_id: 'session-123',
  limit: 100 // Get all
});

// 3. Select messages to evict (oldest 30)
const toEvict = oldMessages.slice(0, 30);

// 4. Summarize them
await mcp.callTool('conversation_summarize', {
  session_id: 'session-123',
  message_range_start: toEvict[0].id,
  message_range_end: toEvict[29].id,
  summary_text: 'User asked about React hooks, TypeScript setup, and WebMCP architecture. ' +
                'Agent provided code examples and debugging tips. Key decisions: use Zustand for state, ' +
                'implement MCP tools with useMCPTool hook.'
});

// 5. Messages are now marked as evicted, summary stored
// Message buffer is now 20 messages instead of 50
// Context window has more room
```

---

## 🎬 Scenario 5: Sleep-time Processing (Background Agent)

**Scenario**: User is inactive for 1 hour. Background "conscious agent" runs to organize memory.

```javascript
// This runs in background (Web Worker or idle callback)

async function consciousProcessing() {
  // 1. Find frequently mentioned entities not in working memory
  const stats = await mcp.callTool('memory_stats');

  // 2. Query for candidates
  const candidates = await mcp.callTool('memory_entity_search', {
    query: '', // Get all
    limit: 100
  });

  // 3. Score entities by importance
  const scored = candidates
    .filter(e => e.mention_count > 3) // Mentioned 3+ times
    .sort((a, b) => {
      const scoreA = a.mention_count * (Date.now() - a.last_mentioned < 86400000 ? 2 : 1);
      const scoreB = b.mention_count * (Date.now() - b.last_mentioned < 86400000 ? 2 : 1);
      return scoreB - scoreA;
    })
    .slice(0, 10); // Top 10

  // 4. Promote to working memory
  for (const entity of scored) {
    await mcp.callTool('working_memory_promote', {
      entity_id: entity.id,
      promotion_reason: 'frequently_mentioned',
      priority: entity.mention_count * 10,
      expires_hours: 24
    });
  }

  // 5. Update core memory blocks
  const userProfile = scored.find(e => e.category === 'person');
  const currentProject = scored.find(e => e.category === 'project');
  const topSkills = scored.filter(e => e.category === 'skill').slice(0, 3);

  await mcp.callTool('memory_block_update', {
    block_type: 'user_profile',
    value: `${userProfile.description}`
  });

  await mcp.callTool('memory_block_update', {
    block_type: 'current_task',
    value: `Working on: ${currentProject.name} - ${currentProject.description}`
  });

  await mcp.callTool('memory_block_update', {
    block_type: 'key_skills',
    value: topSkills.map(s => s.name).join(', ')
  });

  console.log('Conscious processing complete. Working memory optimized.');
}

// Run every hour when idle
setInterval(consciousProcessing, 60 * 60 * 1000);
```

---

## 🎬 Scenario 6: Multi-session Continuity

**Day 1**: User talks about Python project
**Day 5**: User returns, no mention of Python

**Agent Workflow**:

```javascript
// New session starts
const sessionId = 'session-789';

// 1. Load working memory (conscious mode)
const workingMem = await mcp.callTool('working_memory_list');

// Returns:
// [
//   { entity: { category: 'person', name: 'Alex', ... }, priority: 100 },
//   { entity: { category: 'project', name: 'Python Analytics', ... }, priority: 80 },
//   { entity: { category: 'skill', name: 'Python', ... }, priority: 70 }
// ]

// 2. Inject into context (one-shot)
const contextPrefix = `
Working Memory (What I remember about you):
- You are Alex, a software engineer
- You're working on a Python Analytics project
- You're skilled in Python

Let me know how I can help!
`;

// 3. User message arrives (doesn't mention Python)
const userMsg = "Can you recommend a good book on leadership?";

// 4. Auto-mode retrieval
const retrieved = await mcp.callTool('memory_smart_retrieve', {
  query: userMsg,
  mode: 'auto',
  max_results: 3
});

// Might return:
// - User profile (Alex)
// - Past interests (if books mentioned before)
// - Current context (leadership interest is new)

// 5. Store new interest
await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'Leadership books',
  description: 'User interested in leadership books',
  confidence: 80 // Lower confidence, first mention
});

// 6. Agent responds with context
// "Hi Alex! While I know you're primarily working on Python Analytics,
//  I'd be happy to recommend leadership books..."
```

---

## 🎬 Scenario 7: Knowledge Graph Traversal

**User**: "What technologies do I use for WebMCP?"

**Agent Workflow**:

```javascript
// 1. Find WebMCP entity
const webmcp = await mcp.callTool('memory_entity_search', {
  query: 'WebMCP',
  category: 'project',
  limit: 1
});

// 2. Traverse relationships
const related = await mcp.callTool('memory_relationship_find', {
  entity_id: webmcp[0].id,
  relationship_type: 'uses' // Only "uses" relationships
});

// Returns:
// [
//   { to_entity: { name: 'TypeScript', category: 'skill' }, relationship_type: 'uses', strength: 9 },
//   { to_entity: { name: 'React', category: 'skill' }, relationship_type: 'uses', strength: 9 },
//   { to_entity: { name: 'PG-Lite', category: 'skill' }, relationship_type: 'uses', strength: 8 },
//   { to_entity: { name: 'Drizzle ORM', category: 'skill' }, relationship_type: 'uses', strength: 7 }
// ]

// 3. Format response
const technologies = related
  .sort((a, b) => b.strength - a.strength)
  .map(r => r.to_entity.name)
  .join(', ');

// Agent responds:
// "For WebMCP, you're using: TypeScript, React, PG-Lite, and Drizzle ORM."
```

---

## 🎬 Scenario 8: Debugging - Raw SQL Query

**User**: "Show me all my memories about React from the last month"

**Agent Workflow**:

```javascript
// Power user mode: direct SQL access
const result = await mcp.callTool('memory_raw_query', {
  sql: `
    SELECT
      category,
      name,
      description,
      mention_count,
      last_mentioned,
      created_at
    FROM memory_entities
    WHERE
      (name ILIKE '%react%' OR description ILIKE '%react%')
      AND last_mentioned > NOW() - INTERVAL '30 days'
    ORDER BY last_mentioned DESC
  `
});

// Returns raw SQL results:
// [
//   { category: 'preference', name: 'React', mention_count: 15, ... },
//   { category: 'skill', name: 'React Hooks', mention_count: 8, ... },
//   { category: 'project', name: 'WebMCP (uses React)', mention_count: 5, ... }
// ]
```

---

## 🎯 Best Practices for Agent Developers

### 1. **Always extract structured entities**
❌ Don't just store raw text:
```javascript
// Bad
await mcp.callTool('memory_entity_store', {
  category: 'context',
  name: 'Conversation',
  description: 'User said: I love Python and React and TypeScript and...'
});
```

✅ Extract specific facts:
```javascript
// Good
await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'Python',
  description: 'User loves Python programming language'
});
```

### 2. **Use relationships to build context**
Connect related entities:
```javascript
await mcp.callTool('memory_relationship_create', {
  from_entity_id: userEntity.id,
  to_entity_id: projectEntity.id,
  relationship_type: 'works_on',
  strength: 10
});
```

### 3. **Leverage working memory for "hot" context**
Promote frequently accessed entities:
```javascript
if (entity.mention_count > 5) {
  await mcp.callTool('working_memory_promote', {
    entity_id: entity.id,
    promotion_reason: 'frequently_mentioned',
    priority: entity.mention_count * 10,
    expires_hours: 24
  });
}
```

### 4. **Update mention counts & timestamps**
Keep relevance signals fresh:
```javascript
// Backend should auto-increment, but agent can also trigger:
await mcp.callTool('memory_entity_update', {
  entity_id: entityId,
  // last_mentioned is updated automatically
});
```

### 5. **Use smart retrieval, not brute force**
Let the memory system do the work:
```javascript
// Instead of fetching all entities and filtering in agent:
const context = await mcp.callTool('memory_smart_retrieve', {
  query: userMessage,
  mode: 'hybrid',
  max_results: 5
});
// Returns pre-scored, relevant memories
```

---

## 🚀 Quick Start for External Agents

```javascript
// 1. Initialize WebMCP connection
const mcp = await connectToWebMCP('https://your-app.com');

// 2. Start new session
const sessionId = crypto.randomUUID();

// 3. On user message
async function handleUserMessage(message) {
  // Save message
  await mcp.callTool('conversation_save', {
    role: 'user',
    content: message,
    session_id: sessionId
  });

  // Retrieve context
  const context = await mcp.callTool('memory_smart_retrieve', {
    query: message,
    mode: 'hybrid',
    max_results: 5
  });

  // Build prompt with context
  const systemPrompt = `
  You are an AI assistant with access to the user's memory.

  Working Memory (always remember):
  ${context.working_memory.map(m => `- ${m.description}`).join('\n')}

  Relevant Context (for this query):
  ${context.retrieved_entities.map(e => `- ${e.name}: ${e.description}`).join('\n')}
  `;

  // Call LLM with context
  const response = await callLLM(systemPrompt, message);

  // Extract new entities from response (use LLM or NER)
  const newEntities = await extractEntities(message);
  for (const entity of newEntities) {
    await mcp.callTool('memory_entity_store', entity);
  }

  // Save assistant response
  await mcp.callTool('conversation_save', {
    role: 'assistant',
    content: response,
    session_id: sessionId
  });

  return response;
}
```

---

Happy building! 🚀
