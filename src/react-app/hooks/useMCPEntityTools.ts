import { useWebMCP } from '@mcp-b/react-webmcp';
import { toast } from 'sonner';
import { memory_entities } from '@/lib/db';
import type { InsertMemoryEntity } from '@/lib/db/types';

/**
 * Hook to register entity CRUD MCP tools
 *
 * Provides AI agents with direct CRUD operations for memory entities
 * (structured knowledge: facts, preferences, skills, etc.)
 *
 * Should be called in the entities route component.
 */
export function useMCPEntityTools() {
  useWebMCP({
    name: 'create_entity',
    description: `Create a new memory entity (structured knowledge).

Categories:
- fact: Known facts about the world or user
- preference: User preferences
- skill: Skills or capabilities
- rule: Business rules or constraints
- context: Contextual information
- person: People the user knows
- project: Projects or initiatives
- goal: Objectives and goals

Example:
{
  "category": "skill",
  "name": "TypeScript",
  "description": "Expert-level knowledge of TypeScript including advanced types",
  "tags": ["programming", "frontend", "backend"],
  "importance_score": 85,
  "confidence": 90
}`,
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'],
          description: 'Entity category',
        },
        name: { type: 'string', minLength: 1, maxLength: 200, description: 'Entity name' },
        description: { type: 'string', minLength: 1, description: 'Detailed description' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          default: [],
          description: 'Tags for categorization',
        },
        importance_score: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          default: 50,
          description: 'Importance (0-100)',
        },
        confidence: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          default: 100,
          description: 'Confidence level (0-100)',
        },
        memory_tier: {
          type: 'string',
          enum: ['short_term', 'working', 'long_term', 'archived'],
          default: 'short_term',
          description: 'Memory tier',
        },
        memory_type: {
          type: 'string',
          enum: ['episodic', 'semantic'],
          default: 'semantic',
          description: 'Memory type (episodic = specific events, semantic = general knowledge)',
        },
      },
      required: ['category', 'name', 'description'],
    } as const,
    annotations: {
      title: 'Create Entity',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const entity = await memory_entities.create(input as InsertMemoryEntity);
        toast.success('Entity created', {
          description: `Created "${entity.name}" (${entity.category})`,
        });
        return {
          success: true,
          entity,
          message: `Created entity: ${entity.name} (${entity.category})`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to create entity', { description: errorMessage });
        throw new Error(`Failed to create entity: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'update_entity',
    description: `Update an existing memory entity.

Provide the entity ID and any fields you want to update.

Example:
{
  "id": "uuid-here",
  "description": "Updated description",
  "importance_score": 90
}`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'The entity ID to update' },
        category: {
          type: 'string',
          enum: ['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'],
          description: 'New category',
        },
        name: { type: 'string', minLength: 1, maxLength: 200, description: 'New name' },
        description: { type: 'string', minLength: 1, description: 'New description' },
        tags: { type: 'array', items: { type: 'string' }, description: 'New tags' },
        importance_score: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          description: 'New importance',
        },
        confidence: { type: 'integer', minimum: 0, maximum: 100, description: 'New confidence' },
        memory_tier: {
          type: 'string',
          enum: ['short_term', 'working', 'long_term', 'archived'],
          description: 'New memory tier',
        },
        memory_type: {
          type: 'string',
          enum: ['episodic', 'semantic'],
          description: 'New memory type',
        },
      },
      required: ['id'],
    } as const,
    annotations: {
      title: 'Update Entity',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const entity = await memory_entities.update(input);
        if (!entity) {
          throw new Error(`Entity not found: ${input.id}`);
        }
        toast.success('Entity updated', {
          description: `Updated "${entity.name}"`,
        });
        return {
          success: true,
          entity,
          message: `Updated entity: ${entity.name}`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to update entity', { description: errorMessage });
        throw new Error(`Failed to update entity: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'delete_entity',
    description: `Delete a memory entity by ID.

WARNING: This permanently removes the entity and all its relationships.

Example:
{
  "id": "uuid-here"
}`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'The entity ID to delete' },
      },
      required: ['id'],
    } as const,
    annotations: {
      title: 'Delete Entity',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const existing = await memory_entities.get_by_id(input.id);
        if (!existing) {
          throw new Error(`Entity not found: ${input.id}`);
        }

        await memory_entities.remove(input.id);
        toast.success('Entity deleted', {
          description: `Deleted "${existing.name}"`,
        });
        return {
          success: true,
          message: `Deleted entity: ${existing.name} (${existing.category})`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to delete entity', { description: errorMessage });
        throw new Error(`Failed to delete entity: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'search_entities',
    description: `Search memory entities by name or description.

Returns entities matching the query, ordered by importance.

Example:
{ "query": "TypeScript" }
{ "query": "python", "category": "skill" }`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          minLength: 1,
          description: 'Search query (searches name and description)',
        },
        category: {
          type: 'string',
          enum: ['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'],
          description: 'Filter by category',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
          description: 'Maximum results to return',
        },
      },
      required: ['query'],
    } as const,
    annotations: {
      title: 'Search Entities',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const entities = await memory_entities.search(input.query, { category: input.category });
        const limited = entities.slice(0, input.limit ?? 20);
        return {
          query: input.query,
          count: limited.length,
          total: entities.length,
          entities: limited.map(e => ({
            id: e.id,
            category: e.category,
            name: e.name,
            description: e.description.substring(0, 200) + (e.description.length > 200 ? '...' : ''),
            tags: e.tags,
            importance_score: e.importance_score,
            confidence: e.confidence,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to search entities: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'list_entities',
    description: `List memory entities, optionally filtered by category.

Returns entities ordered by importance (highest first).

Example:
{} // List all
{ "category": "skill" } // Filter by category
{ "limit": 50 } // Limit results`,
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'],
          description: 'Filter by category',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
          description: 'Maximum results',
        },
      },
    } as const,
    annotations: {
      title: 'List Entities',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const entities = await memory_entities.get_all({
          category: input.category,
          limit: input.limit ?? 50
        });
        return {
          count: entities.length,
          entities: entities.map(e => ({
            id: e.id,
            category: e.category,
            name: e.name,
            description: e.description.substring(0, 150) + (e.description.length > 150 ? '...' : ''),
            tags: e.tags,
            importance_score: e.importance_score,
            memory_tier: e.memory_tier,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to list entities: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'get_entity',
    description: `Get a single entity by ID with full details.

Example:
{
  "id": "uuid-here"
}`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'The entity ID to retrieve' },
      },
      required: ['id'],
    } as const,
    annotations: {
      title: 'Get Entity',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const entity = await memory_entities.get_by_id(input.id);
        if (!entity) {
          throw new Error(`Entity not found: ${input.id}`);
        }
        return entity;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get entity: ${errorMessage}`);
      }
    },
  });
}
