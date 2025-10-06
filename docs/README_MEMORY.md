# 🧠 WebMCP Agent Memory System

> **Persistent, browser-based AI agent memory using PG-Lite + WebMCP**

---

## 🎯 What is This?

A **SQL-first hybrid memory system** that enables AI agents to:
- 💾 Store structured memories in the browser (PG-Lite)
- 🔍 Retrieve context intelligently (SQL + optional embeddings)
- 🌐 Access memories via WebMCP tools (Chrome extension, Claude Desktop, etc.)
- 🔗 Build knowledge graphs (entities + relationships)
- 🧠 Manage working memory (conscious mode)

---

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────────┐
│         EXTERNAL AGENT                  │
│   (Chrome Extension, Claude Desktop)    │
└──────────────┬──────────────────────────┘
               │ WebMCP Tools
               ↓
┌─────────────────────────────────────────┐
│         WEBMCP MEMORY TOOLS             │
│  memory_entity_store                    │
│  memory_entity_search                   │
│  memory_relationship_create             │
│  working_memory_promote                 │
│  memory_smart_retrieve                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         PG-LITE (Browser DB)            │
│  ┌────────────────────────────────┐    │
│  │  Memory Entities               │    │
│  │  (facts, skills, preferences)  │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │  Relationships (Knowledge Graph)│   │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │  Working Memory (Conscious)    │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │  Conversations (Message Buffer)│    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. **Review the Plan**
Read the detailed implementation plan:
- 📄 [**MEMORY_IMPLEMENTATION_PLAN.md**](./MEMORY_IMPLEMENTATION_PLAN.md) - Architecture & roadmap

### 2. **Understand the Schema**
Check out the proposed database schema:
- 📄 [**memory-schema-proposal.ts**](./memory-schema-proposal.ts) - Drizzle schema

### 3. **Explore the Tools**
See the WebMCP tool definitions:
- 📄 [**memory-tools-proposal.ts**](./memory-tools-proposal.ts) - MCP tools

### 4. **See Examples**
Learn how agents use the memory system:
- 📄 [**MEMORY_USAGE_EXAMPLES.md**](./MEMORY_USAGE_EXAMPLES.md) - Real-world scenarios

### 5. **Compare Approaches**
Understand why we chose this approach:
- 📄 [**MEMORY_APPROACHES_COMPARISON.md**](./MEMORY_APPROACHES_COMPARISON.md) - RAG vs SQL vs Hybrid

---

## 💡 Key Concepts

### Memory Tiers

| Tier | What | Where | When |
|------|------|-------|------|
| **Core Memory** | User profile, agent persona | Always in context | Manual updates |
| **Working Memory** | 5-10 essential entities | In context (conscious mode) | Auto-promoted, expires after 24h |
| **Message Buffer** | Recent conversation | In context | Evicted when full |
| **Archival Memory** | All structured entities | External (PG-Lite) | Retrieved on-demand |

### Retrieval Modes

**🧠 Conscious Mode** (Short-term)
- Load essential memories at session start
- One-shot injection
- Based on frequency + recency

**🔍 Auto Mode** (Dynamic)
- Intelligent search per query
- SQL-first (keyword match)
- Optional semantic fallback

**🔄 Hybrid Mode** (Recommended)
- Combine both approaches
- Working memory + query-specific retrieval

---

## 🗂️ Database Schema Overview

### Core Tables

```sql
-- Always-in-context memory
memory_blocks (
  id, block_type, label, value, char_limit, priority, ...
)

-- Structured long-term knowledge
memory_entities (
  id, category, name, description, confidence,
  mention_count, last_mentioned, embedding?, ...
)

-- Knowledge graph
memory_relationships (
  id, from_entity_id, to_entity_id, relationship_type, strength, ...
)

-- Promoted to context (conscious mode)
working_memory (
  id, entity_id, promotion_reason, priority, expires_at, ...
)

-- Recent chat
conversation_messages (
  id, role, content, session_id, is_evicted, ...
)

-- Compressed history
conversation_summaries (
  id, session_id, message_range, summary_text, ...
)
```

### Entity Categories

- **fact**: Objective information
- **preference**: User likes/dislikes
- **skill**: Abilities & knowledge
- **rule**: Constraints & guidelines
- **context**: Session information
- **person**: People & relationships
- **project**: Work & goals
- **goal**: Objectives

---

## 🔧 WebMCP Tools

### Memory Storage
- `memory_entity_store` - Store structured knowledge
- `memory_entity_update` - Update existing entity
- `memory_entity_search` - Search by keyword/semantic
- `memory_block_update` - Update core memory

### Knowledge Graph
- `memory_relationship_create` - Connect entities
- `memory_relationship_find` - Traverse graph

### Working Memory
- `working_memory_promote` - Promote to context
- `working_memory_list` - List conscious memories

### Conversations
- `conversation_save` - Store message
- `conversation_get_recent` - Get message buffer
- `conversation_summarize` - Compress & evict

### Smart Retrieval
- `memory_smart_retrieve` - AI-powered context injection

### Analytics
- `memory_stats` - System statistics

---

## 📈 Why SQL-First?

Modern research (2024-2025) shows SQL-first beats pure RAG:

| Feature | RAG | SQL-First | Hybrid |
|---------|-----|-----------|--------|
| **Transparent** | ❌ | ✅ | ✅ |
| **Fast** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cheap** | ❌ | ✅ | ⭐⭐⭐ |
| **Structured** | ❌ | ✅ | ✅ |
| **Semantic** | ✅ | ❌ | ✅ |

**Our approach: SQL-first with optional embeddings**

---

## 🎯 Implementation Phases

### Phase 1: Foundation ✅
- [x] Schema design
- [x] Tool definitions
- [x] Implementation plan
- [ ] Drizzle migration

### Phase 2: Core Tools 🚧
- [ ] Entity CRUD operations
- [ ] Relationship graph
- [ ] Conversation storage

### Phase 3: Smart Retrieval 📅
- [ ] Scoring algorithm
- [ ] Conscious mode
- [ ] Auto mode
- [ ] Hybrid mode

### Phase 4: Optimization 📅
- [ ] Optional embeddings
- [ ] Message eviction
- [ ] Analytics

### Phase 5: UI/UX 📅
- [ ] Memory browser
- [ ] Knowledge graph viz
- [ ] Debug panel

---

## 💻 Example Usage

### Store a Memory
```javascript
// External agent stores user preference
await mcp.callTool('memory_entity_store', {
  category: 'preference',
  name: 'Python',
  description: 'User loves Python programming language',
  confidence: 95
});
```

### Retrieve Context
```javascript
// Agent retrieves relevant memories for query
const context = await mcp.callTool('memory_smart_retrieve', {
  query: 'Can you help me with React hooks?',
  mode: 'hybrid',
  max_results: 5
});

// Returns:
// {
//   working_memory: [{ name: 'Alex', description: '...' }],
//   retrieved_entities: [{ name: 'React', relevance_score: 0.95 }]
// }
```

### Build Knowledge Graph
```javascript
// Connect related entities
await mcp.callTool('memory_relationship_create', {
  from_entity_id: 'alex_id',
  to_entity_id: 'webmcp_id',
  relationship_type: 'works_on',
  strength: 10
});
```

---

## 📚 Resources

### Research & Inspiration
- **Memori** - SQL-first agent memory ([docs](https://docs.gibsonai.app/memori))
- **Letta** - Hybrid memory system ([docs](https://docs.letta.com/memory/overview))
- **MemGPT** - OS-inspired memory ([paper](https://arxiv.org/abs/2310.08560))
- **Atomic Agents** - Context providers ([docs](https://atomic-agents.io/context-providers/))

### Our Documentation
- [Implementation Plan](./MEMORY_IMPLEMENTATION_PLAN.md) - Full architecture & roadmap
- [Schema Proposal](./memory-schema-proposal.ts) - Database schema
- [Tool Definitions](./memory-tools-proposal.ts) - WebMCP tools
- [Usage Examples](./MEMORY_USAGE_EXAMPLES.md) - Real-world scenarios
- [Approach Comparison](./MEMORY_APPROACHES_COMPARISON.md) - RAG vs SQL vs Hybrid

---

## 🤝 Contributing

This is the foundation for WebMCP agent memory. Let's discuss:

### Questions to Decide
1. **Embeddings**: Use OpenAI API or local model (transformers.js)?
2. **Storage limits**: Max entities per user? Auto-prune strategy?
3. **Multi-agent**: How to handle multiple agents sharing memory?
4. **Real-time sync**: WebSocket updates when memory changes?
5. **Versioning**: Track memory evolution over time?

### Next Steps
1. Review the implementation plan
2. Discuss schema design
3. Choose embedding strategy (or skip for MVP)
4. Start Phase 1 implementation
5. Build & iterate

---

## 🌟 Vision

Imagine an AI agent that:
- 🎯 **Remembers you** across sessions (name, preferences, projects)
- 🔗 **Connects ideas** via knowledge graph (Python → FastAPI → WebMCP)
- 🧠 **Learns over time** (frequently mentioned → working memory)
- 📊 **Explains itself** (SQL queries are transparent)
- 🔒 **You own the data** (export SQLite file anytime)

**That's the power of WebMCP agent memory.** 🚀

---

## 📝 License

[Your license here]

---

## 🙏 Acknowledgments

Built on research from:
- Memori (GibsonAI)
- Letta
- MemGPT (UC Berkeley)
- Atomic Agents

---

**Let's build the future of agent memory! 🧠✨**
