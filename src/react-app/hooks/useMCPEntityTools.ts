import { z } from 'zod';
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
      category: z.enum(['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'])
        .describe('Entity category'),
      name: z.string().min(1).max(200)
        .describe('Entity name'),
      description: z.string().min(1)
        .describe('Detailed description'),
      tags: z.array(z.string()).optional().default([])
        .describe('Tags for categorization'),
      importance_score: z.number().int().min(0).max(100).optional().default(50)
        .describe('Importance (0-100)'),
      confidence: z.number().int().min(0).max(100).optional().default(100)
        .describe('Confidence level (0-100)'),
      memory_tier: z.enum(['short_term', 'working', 'long_term', 'archived']).optional().default('short_term')
        .describe('Memory tier'),
      memory_type: z.enum(['episodic', 'semantic']).optional().default('semantic')
        .describe('Memory type (episodic = specific events, semantic = general knowledge)'),
    },
    annotations: {
      title: 'Create Entity',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
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
      id: z.string().uuid().describe('The entity ID to update'),
      category: z.enum(['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal']).optional()
        .describe('New category'),
      name: z.string().min(1).max(200).optional()
        .describe('New name'),
      description: z.string().min(1).optional()
        .describe('New description'),
      tags: z.array(z.string()).optional()
        .describe('New tags'),
      importance_score: z.number().int().min(0).max(100).optional()
        .describe('New importance'),
      confidence: z.number().int().min(0).max(100).optional()
        .describe('New confidence'),
      memory_tier: z.enum(['short_term', 'working', 'long_term', 'archived']).optional()
        .describe('New memory tier'),
      memory_type: z.enum(['episodic', 'semantic']).optional()
        .describe('New memory type'),
    },
    annotations: {
      title: 'Update Entity',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
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
      id: z.string().uuid().describe('The entity ID to delete'),
    },
    annotations: {
      title: 'Delete Entity',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
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
      query: z.string().min(1)
        .describe('Search query (searches name and description)'),
      category: z.enum(['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal']).optional()
        .describe('Filter by category'),
      limit: z.number().int().min(1).max(100).optional().default(20)
        .describe('Maximum results to return'),
    },
    annotations: {
      title: 'Search Entities',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const entities = await memory_entities.search(input.query, { category: input.category });
        const limited = entities.slice(0, input.limit);
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
      category: z.enum(['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal']).optional()
        .describe('Filter by category'),
      limit: z.number().int().min(1).max(100).optional().default(50)
        .describe('Maximum results'),
    },
    annotations: {
      title: 'List Entities',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const entities = await memory_entities.get_all({
          category: input.category,
          limit: input.limit
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
      id: z.string().uuid().describe('The entity ID to retrieve'),
    },
    annotations: {
      title: 'Get Entity',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
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
