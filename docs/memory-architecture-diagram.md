# WebMCP Memory Architecture - Visual Diagrams

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      EXTERNAL CLIENTS                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │   Chrome    │  │    Claude    │  │   Other MCP Clients    │  │
│  │  Extension  │  │   Desktop    │  │                        │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
└─────────┼─────────────────┼──────────────────────┼───────────────┘
          │                 │                      │
          │         WebMCP Protocol (HTTP/WS)      │
          └─────────────────┼──────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                     WEBMCP SERVER (Browser)                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    MCP TOOL REGISTRY                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Storage    │  │  Retrieval   │  │  Relationship   │  │  │
│  │  │    Tools     │  │    Tools     │  │     Tools       │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              MEMORY MANAGER (Logic Layer)                  │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐    │  │
│  │  │  Entity    │  │  Retrieval  │  │  Summarization   │    │  │
│  │  │ Extraction │  │   Scoring   │  │     Engine       │    │  │
│  │  └────────────┘  └─────────────┘  └──────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         PG-LITE (Postgres in Browser) + DRIZZLE ORM        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Entities   │  │Relationships │  │  Conversations  │  │  │
│  │  │   (Archival) │  │   (Graph)    │  │   (Buffer)      │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Working    │  │    Core      │  │   Summaries     │  │  │
│  │  │   Memory     │  │   Memory     │  │   (Evicted)     │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Memory Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER SENDS MESSAGE                        │
│                  "I love Python and FastAPI"                    │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                2. SAVE TO MESSAGE BUFFER                        │
│   conversation_messages: { role: 'user', content: '...' }      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              3. ENTITY EXTRACTION (Structured)                  │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │   Preference:   │  │   Preference:   │                      │
│  │   Python        │  │   FastAPI       │                      │
│  │   confidence:95 │  │   confidence:90 │                      │
│  └─────────────────┘  └─────────────────┘                      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│           4. STORE IN ARCHIVAL MEMORY (memory_entities)         │
│   [Python entity] ─uses─> [FastAPI entity]                     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              5. CHECK IF SHOULD PROMOTE                         │
│   mention_count > 3? YES → Promote to working_memory           │
│   recently mentioned? YES → Increase priority                   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│           6. AGENT RETRIEVES CONTEXT (Next Query)               │
│   Query: "Help me debug FastAPI code"                          │
│   → Retrieve: [Python, FastAPI, user profile]                  │
│   → Inject into context window                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                 7. AGENT RESPONDS WITH CONTEXT                  │
│   "I know you love Python and FastAPI. Here's a debugging      │
│    approach for your FastAPI code..."                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Retrieval Flow (Hybrid Mode)

```
┌────────────────────────────────────────────────────┐
│         USER QUERY: "Help me with React hooks"    │
└───────────────────────┬────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  1. WORKING MEMORY (Conscious) │
        │     Always included            │
        └───────────────┬───────────────┘
                        ↓
        ┌───────────────────────────────────────────┐
        │ Returns: [User: Alex, Project: WebMCP]   │
        └───────────────┬───────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  2. SQL SEARCH (Primary)      │
        │     Fast, transparent         │
        └───────────────┬───────────────┘
                        ↓
        ┌────────────────────────────────────────────────┐
        │ SELECT * FROM memory_entities                  │
        │ WHERE name ILIKE '%react%'                     │
        │    OR description ILIKE '%react%'              │
        │ ORDER BY mention_count DESC, last_mentioned    │
        │ LIMIT 5                                        │
        └───────────────┬────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────────────────┐
        │ Returns: [React entity, React Hooks entity]   │
        │ (2 results)                                   │
        └───────────────┬───────────────────────────────┘
                        ↓
        ┌────────────────────────────────┐
        │  3. CHECK RESULT COUNT         │
        │     < 3 results? YES           │
        └───────────────┬────────────────┘
                        ↓
        ┌───────────────────────────────────────┐
        │  4. SEMANTIC SEARCH (Fallback)        │
        │     Optional embeddings               │
        └───────────────┬───────────────────────┘
                        ↓
        ┌─────────────────────────────────────────────────┐
        │ Generate embedding for "Help me with React      │
        │ hooks"                                          │
        │ SELECT * FROM memory_entities                   │
        │ ORDER BY embedding <=> query_embedding          │
        │ LIMIT 3                                         │
        └───────────────┬─────────────────────────────────┘
                        ↓
        ┌────────────────────────────────────────────────┐
        │ Returns: [TypeScript entity] (related concept) │
        └───────────────┬────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────────┐
        │  5. GRAPH TRAVERSAL (Relationships)   │
        │     Find connected entities           │
        └───────────────┬───────────────────────┘
                        ↓
        ┌──────────────────────────────────────────────┐
        │ SELECT * FROM memory_relationships           │
        │ WHERE from_entity_id IN [React, TypeScript]  │
        └───────────────┬──────────────────────────────┘
                        ↓
        ┌─────────────────────────────────────────────┐
        │ Returns: [WebMCP uses React]                │
        └───────────────┬─────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │  6. COMBINE & RE-RANK             │
        │     Score: relevance + recency +  │
        │     frequency + working_mem_bonus │
        └───────────────┬───────────────────┘
                        ↓
        ┌──────────────────────────────────────────────┐
        │ FINAL CONTEXT (Top 5):                       │
        │ 1. User: Alex (score: 1.0, working memory)   │
        │ 2. React (score: 0.95, exact match)          │
        │ 3. React Hooks (score: 0.92, exact match)    │
        │ 4. TypeScript (score: 0.75, semantic)        │
        │ 5. WebMCP (score: 0.6, relationship)         │
        └───────────────┬──────────────────────────────┘
                        ↓
        ┌───────────────────────────────────────────────┐
        │  7. INJECT INTO AGENT CONTEXT                 │
        │     Agent now has personalized context        │
        └───────────────┬───────────────────────────────┘
                        ↓
        ┌──────────────────────────────────────────────┐
        │ AGENT RESPONSE:                              │
        │ "Hey Alex! I see you're working with React   │
        │  on WebMCP and you love TypeScript. Here's   │
        │  how to approach React hooks..."             │
        └──────────────────────────────────────────────┘
```

---

## 📊 Memory Tiers & Context Window

```
┌─────────────────────────────────────────────────────────────────┐
│                       CONTEXT WINDOW                            │
│                     (8K tokens available)                       │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  TIER 1: CORE MEMORY (Always in context)              │    │
│  │  ~500 tokens                                           │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ User Profile: Name, role, location           │    │    │
│  │  │ Agent Persona: Helpful, technical assistant  │    │    │
│  │  │ Current Task: Building WebMCP memory system  │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  TIER 2: WORKING MEMORY (Conscious - Promoted)        │    │
│  │  ~1000 tokens                                          │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ [Python] - mentioned 10x, last: today        │    │    │
│  │  │ [FastAPI] - mentioned 8x, last: yesterday    │    │    │
│  │  │ [WebMCP Project] - current focus             │    │    │
│  │  │ [TypeScript] - mentioned 6x, last: today     │    │    │
│  │  │ [React] - mentioned 5x, last: 2 days ago     │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  TIER 3: MESSAGE BUFFER (Recent conversation)          │    │
│  │  ~2000-4000 tokens                                     │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ User: "Can you help with React hooks?"       │    │    │
│  │  │ Assistant: "Sure! What's the issue?"         │    │    │
│  │  │ User: "useState not re-rendering..."         │    │    │
│  │  │ ... (last 20-50 messages)                    │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  TIER 4: AUTO-RETRIEVED CONTEXT (Query-specific)      │    │
│  │  ~500-1000 tokens                                      │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ [React Hooks] - retrieved for current query  │    │    │
│  │  │ [useEffect] - related entity from graph      │    │    │
│  │  │ [Debugging skills] - semantic match          │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Total used: ~4000-6500 tokens                                 │
│  Remaining: ~1500-4000 tokens for agent response               │
└─────────────────────────────────────────────────────────────────┘

        ↕ Smart Retrieval (Auto Mode)

┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL STORAGE (PG-Lite Database)                │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  TIER 5: ARCHIVAL MEMORY (Long-term, searchable)      │    │
│  │                                                        │    │
│  │  memory_entities: 1,000+ entities                     │    │
│  │  ├─ Facts (200)                                       │    │
│  │  ├─ Preferences (150)                                 │    │
│  │  ├─ Skills (180)                                      │    │
│  │  ├─ Rules (50)                                        │    │
│  │  ├─ People (100)                                      │    │
│  │  ├─ Projects (120)                                    │    │
│  │  └─ Goals (200)                                       │    │
│  │                                                        │    │
│  │  memory_relationships: 2,000+ connections             │    │
│  │  (Knowledge graph)                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  TIER 6: CONVERSATION SUMMARIES (Evicted history)     │    │
│  │                                                        │    │
│  │  conversation_summaries: 50+ summaries                │    │
│  │  Each summary = 20-30 compressed messages             │    │
│  │  Total history: 1,000+ messages compressed            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Knowledge Graph Example

```
                    ┌──────────┐
                    │   Alex   │
                    │ (person) │
                    └────┬─────┘
                         │
            ┌────────────┴────────────┐
            │                         │
        works_on                   prefers
            │                         │
            ↓                         ↓
      ┌──────────┐              ┌──────────┐
      │  WebMCP  │              │  Python  │
      │(project) │              │ (skill)  │
      └────┬─────┘              └────┬─────┘
           │                         │
       ┌───┴───┬───────────┐         │
       │       │           │         │
      uses    uses        uses      uses
       │       │           │         │
       ↓       ↓           ↓         ↓
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ React  │ │PG-Lite │ │Drizzle │ │FastAPI │
  │(skill) │ │(skill) │ │(skill) │ │(skill) │
  └────────┘ └────────┘ └────────┘ └────┬───┘
                                        │
                                    related_to
                                        │
                                        ↓
                                   ┌────────┐
                                   │ Python │
                                   │(skill) │
                                   └────────┘
```

**Graph Traversal Query:**
```typescript
// Find all technologies Alex uses for WebMCP
1. Find: Alex (person)
2. Follow: "works_on" → WebMCP (project)
3. Follow: "uses" → [React, PG-Lite, Drizzle]
4. Follow relationships from those → [Python (via FastAPI)]

Result: Alex uses React, PG-Lite, Drizzle, and indirectly Python for WebMCP
```

---

## ⏱️ Message Buffer Eviction Flow

```
┌────────────────────────────────────────────────────────┐
│         MESSAGE BUFFER (Max 50 messages)               │
│  ┌──────────────────────────────────────────────┐     │
│  │ [1] User: "Hi"                               │     │
│  │ [2] Assistant: "Hello!"                      │     │
│  │ [3] User: "I love Python"                    │     │
│  │ ...                                          │     │
│  │ [48] User: "What about FastAPI?"             │     │
│  │ [49] Assistant: "FastAPI is great for..."    │     │
│  │ [50] User: "Can you help me debug?"          │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
                        ↓
          🚨 BUFFER FULL! Eviction triggered
                        ↓
┌────────────────────────────────────────────────────────┐
│              EVICTION PROCESS                          │
│                                                        │
│  1. Select oldest 30 messages (70% of buffer)         │
│  2. Extract key entities/facts from messages          │
│  3. Summarize: "User discussed Python preferences,    │
│     asked about FastAPI setup, debugged hooks..."     │
│  4. Store summary in conversation_summaries           │
│  5. Mark messages [1-30] as is_evicted = true         │
│  6. Link messages to summary_id                       │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│     MESSAGE BUFFER (Now has space for 30 more)        │
│  ┌──────────────────────────────────────────────┐     │
│  │ [31] User: "Explained project goals"         │     │
│  │ [32] Assistant: "Got it, let's start with..." │     │
│  │ ...                                          │     │
│  │ [50] User: "Can you help me debug?"          │     │
│  │ [51] ← New message goes here                 │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│         CONVERSATION SUMMARIES (Archival)              │
│  ┌──────────────────────────────────────────────┐     │
│  │ Summary #1: "User introduced self as Alex,   │     │
│  │  discussed Python/React preferences..."      │     │
│  │  (messages 1-30)                             │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  Can be retrieved later if needed:                    │
│  "What did we discuss earlier?" → Retrieve summary    │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Scoring Algorithm Visualization

```
Entity Relevance Score = f(Recency, Frequency, Semantic, Working Memory)

┌──────────────────────────────────────────────────────┐
│  RECENCY SCORE (Exponential decay)                   │
│                                                      │
│  Score                                               │
│    1.0│                                              │
│       │●                                             │
│    0.8│  ●                                           │
│       │    ●●                                        │
│    0.6│       ●●                                     │
│       │          ●●●                                 │
│    0.4│             ●●●●                             │
│       │                 ●●●●●                        │
│    0.2│                      ●●●●●●●●●               │
│       │                              ●●●●●●●●●●●●    │
│    0.0└────────────────────────────────────────────  │
│       0    7    14   21   28   35   42   49   56    │
│                    Days Since Last Mention           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  FREQUENCY SCORE (Logarithmic scale)                 │
│                                                      │
│  Score                                               │
│    1.0│                              ●●●●●●●●●●●●●●  │
│       │                        ●●●●●●                │
│    0.8│                   ●●●●●                      │
│       │              ●●●●●                           │
│    0.6│         ●●●●●                                │
│       │     ●●●●                                     │
│    0.4│  ●●●                                         │
│       │●●                                            │
│    0.2│●                                             │
│       │                                              │
│    0.0└────────────────────────────────────────────  │
│       1    5    10   15   20   25   30   35   40    │
│                    Mention Count                     │
└──────────────────────────────────────────────────────┘

FINAL SCORE CALCULATION:
────────────────────────────────────────────────────────
score = (recency × 0.3) + (frequency × 0.2) +
        (semantic_similarity × 0.4) +
        (working_memory_bonus × 0.1)

Example:
  Entity: "React Hooks"
  Recency: last mentioned 2 days ago → 0.85
  Frequency: mentioned 8 times → 0.70
  Semantic: "React hooks" vs query → 0.95
  Working Memory: not in WM → 0.0

  Score = (0.85 × 0.3) + (0.70 × 0.2) + (0.95 × 0.4) + 0.0
        = 0.255 + 0.14 + 0.38 + 0.0
        = 0.775 (77.5% relevance)
```

---

## 🔄 Conscious Processing (Sleep-time Agent)

```
┌──────────────────────────────────────────────────────────┐
│         USER INACTIVE FOR 1 HOUR                         │
│         (No messages sent)                               │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  CONSCIOUS AGENT WAKES UP (Background Process)           │
│  "Let me organize memories while user is away..."        │
└────────────────────────┬─────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 1. ANALYZE MEMORY PATTERNS     │
        └────────────────┬───────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  SELECT * FROM memory_entities                           │
│  ORDER BY mention_count DESC, last_mentioned DESC        │
│  LIMIT 100                                               │
│                                                          │
│  Results:                                                │
│  - Python: 15 mentions, last: today                     │
│  - FastAPI: 10 mentions, last: yesterday                │
│  - React: 8 mentions, last: 2 days ago                  │
│  - WebMCP: 12 mentions, last: today                     │
│  - TypeScript: 7 mentions, last: today                  │
└────────────────────────┬─────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 2. SCORE & RANK ENTITIES       │
        └────────────────┬───────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  Apply scoring algorithm:                                │
│  - Python: score 0.95 (high freq + recent)              │
│  - WebMCP: score 0.92 (project focus)                   │
│  - FastAPI: score 0.88                                  │
│  - TypeScript: score 0.85                               │
│  - React: score 0.78 (older)                            │
└────────────────────────┬─────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 3. PROMOTE TO WORKING MEMORY   │
        └────────────────┬───────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  INSERT INTO working_memory (entity_id, priority, ...)   │
│  VALUES                                                  │
│    (python_id, 95, 'frequently_mentioned', ...),        │
│    (webmcp_id, 92, 'current_project', ...),             │
│    (fastapi_id, 88, 'frequently_mentioned', ...),       │
│    (typescript_id, 85, 'frequently_mentioned', ...),    │
│    (react_id, 78, 'frequently_mentioned', ...)          │
└────────────────────────┬─────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 4. UPDATE CORE MEMORY BLOCKS   │
        └────────────────┬───────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  UPDATE memory_blocks SET value = ...                    │
│                                                          │
│  Block: user_profile                                     │
│  Value: "Alex | Software Engineer | WebMCP Developer"   │
│                                                          │
│  Block: current_focus                                    │
│  Value: "Working on WebMCP with Python, FastAPI, React" │
│                                                          │
│  Block: top_skills                                       │
│  Value: "Python, TypeScript, React, FastAPI"            │
└────────────────────────┬─────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 5. CLEANUP EXPIRED MEMORIES    │
        └────────────────┬───────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  DELETE FROM working_memory                              │
│  WHERE expires_at < NOW()                                │
│                                                          │
│  Removed 3 expired entities from working memory          │
└────────────────────────┬─────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 6. SLEEP UNTIL NEXT CYCLE      │
        │    (1 hour later)              │
        └────────────────────────────────┘
```

---

## 📊 Data Flow Summary

```
┌─────────────┐
│   USER      │
│  MESSAGE    │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│  conversation_      │
│  messages           │
│  (message buffer)   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Entity Extraction  │
│  (structured)       │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  memory_entities    │
│  (long-term)        │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Frequency check    │
│  mention_count > 3? │
└──────┬──────────────┘
       │ Yes
       ↓
┌─────────────────────┐
│  working_memory     │
│  (promoted)         │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Smart Retrieval    │
│  (on next query)    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Agent Context      │
│  (personalized)     │
└─────────────────────┘
```

---

These diagrams provide a visual understanding of how the WebMCP memory system works, from data storage to retrieval and context injection! 🎨
