import { z } from 'zod';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { toast } from 'sonner';
import { memory_blocks, memory_entities, entity_relationships } from '@/lib/db';
import type { InsertMemoryBlock, InsertMemoryEntity, InsertEntityRelationship } from '@/lib/db/types';

/**
 * Hook to register data CRUD MCP tools
 *
 * Provides AI agents with direct CRUD operations for:
 * - Memory Blocks (always-in-context core memories)
 * - Memory Entities (structured knowledge: facts, preferences, skills, etc.)
 * - Entity Relationships (knowledge graph connections)
 */
export function useMCPDataTools() {
  // ============================================================================
  // MEMORY BLOCKS TOOLS
  // ============================================================================

  useWebMCP({
    name: 'create_memory_block',
    description: `Create a new memory block (always-in-context core memory).

Memory blocks are the 5-10 most important pieces of information that should always be available to the AI.

Block Types:
- user_profile: Information about the user
- agent_persona: AI agent's personality/behavior
- current_goals: Active objectives
- context: General important context

Example:
{
  "block_type": "user_profile",
  "label": "Name",
  "value": "The user's name is John and he prefers TypeScript",
  "priority": 10,
  "char_limit": 500
}`,
    inputSchema: {
      block_type: z.enum(['user_profile', 'agent_persona', 'current_goals', 'context'])
        .describe('Type of memory block'),
      label: z.string().min(1).max(200)
        .describe('Human-readable label for the block'),
      value: z.string().min(1)
        .describe('The actual memory content'),
      priority: z.number().int().min(0).max(100).optional().default(50)
        .describe('Priority (0-100, higher = more important)'),
      char_limit: z.number().int().positive().optional().default(500)
        .describe('Maximum character limit for this block'),
      metadata: z.record(z.unknown()).optional()
        .describe('Optional structured metadata'),
    },
    annotations: {
      title: 'Create Memory Block',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const block = await memory_blocks.create(input as InsertMemoryBlock);
        toast.success('Memory block created', {
          description: `Created "${block.label}"`,
        });
        return {
          success: true,
          block,
          message: `Created memory block: ${block.label} (${block.block_type})`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to create memory block', { description: errorMessage });
        throw new Error(`Failed to create memory block: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'update_memory_block',
    description: `Update an existing memory block.

Provide the block ID and any fields you want to update.

Example:
{
  "id": "uuid-here",
  "value": "Updated content",
  "priority": 80
}`,
    inputSchema: {
      id: z.string().uuid().describe('The memory block ID to update'),
      block_type: z.enum(['user_profile', 'agent_persona', 'current_goals', 'context']).optional()
        .describe('New block type'),
      label: z.string().min(1).max(200).optional()
        .describe('New label'),
      value: z.string().min(1).optional()
        .describe('New content'),
      priority: z.number().int().min(0).max(100).optional()
        .describe('New priority'),
      char_limit: z.number().int().positive().optional()
        .describe('New character limit'),
      metadata: z.record(z.unknown()).optional()
        .describe('New metadata'),
    },
    annotations: {
      title: 'Update Memory Block',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const block = await memory_blocks.update(input);
        if (!block) {
          throw new Error(`Memory block not found: ${input.id}`);
        }
        toast.success('Memory block updated', {
          description: `Updated "${block.label}"`,
        });
        return {
          success: true,
          block,
          message: `Updated memory block: ${block.label}`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to update memory block', { description: errorMessage });
        throw new Error(`Failed to update memory block: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'delete_memory_block',
    description: `Delete a memory block by ID.

WARNING: This permanently removes the memory block.

Example:
{
  "id": "uuid-here"
}`,
    inputSchema: {
      id: z.string().uuid().describe('The memory block ID to delete'),
    },
    annotations: {
      title: 'Delete Memory Block',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        // Get the block first for confirmation message
        const existing = await memory_blocks.get_by_id(input.id);
        if (!existing) {
          throw new Error(`Memory block not found: ${input.id}`);
        }

        await memory_blocks.remove(input.id);
        toast.success('Memory block deleted', {
          description: `Deleted "${existing.label}"`,
        });
        return {
          success: true,
          message: `Deleted memory block: ${existing.label} (${existing.block_type})`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to delete memory block', { description: errorMessage });
        throw new Error(`Failed to delete memory block: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'list_memory_blocks',
    description: `List all memory blocks, optionally filtered by type.

Returns blocks ordered by priority (highest first).

Example:
{} // List all
{ "block_type": "user_profile" } // Filter by type`,
    inputSchema: {
      block_type: z.enum(['user_profile', 'agent_persona', 'current_goals', 'context']).optional()
        .describe('Filter by block type'),
    },
    annotations: {
      title: 'List Memory Blocks',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        let blocks;
        if (input.block_type) {
          blocks = await memory_blocks.get_by_type(input.block_type);
        } else {
          blocks = await memory_blocks.get_all();
        }
        return {
          count: blocks.length,
          blocks: blocks.map(b => ({
            id: b.id,
            block_type: b.block_type,
            label: b.label,
            value: b.value.substring(0, 200) + (b.value.length > 200 ? '...' : ''),
            priority: b.priority,
            token_cost: b.token_cost,
          })),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to list memory blocks: ${errorMessage}`);
      }
    },
  });

  // ============================================================================
  // MEMORY ENTITIES TOOLS
  // ============================================================================

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

  // ============================================================================
  // ENTITY RELATIONSHIPS TOOLS
  // ============================================================================

  useWebMCP({
    name: 'create_relationship',
    description: `Create a relationship between two entities.

This builds the knowledge graph by connecting entities.

Common relationship types:
- uses: Entity A uses entity B
- related_to: General relationship
- works_on: Person works on project
- knows: Person knows another person
- requires: Skill requires another skill
- part_of: Entity is part of another

Example:
{
  "from_entity_id": "uuid-of-python-skill",
  "to_entity_id": "uuid-of-data-science-skill",
  "relationship_type": "uses",
  "description": "Python is commonly used for data science",
  "strength": 8
}`,
    inputSchema: {
      from_entity_id: z.string().uuid()
        .describe('Source entity ID'),
      to_entity_id: z.string().uuid()
        .describe('Target entity ID'),
      relationship_type: z.string().min(1).max(100)
        .describe('Type of relationship'),
      description: z.string().optional()
        .describe('Optional description of the relationship'),
      strength: z.number().int().min(1).max(10).optional().default(5)
        .describe('Relationship strength (1-10)'),
    },
    annotations: {
      title: 'Create Relationship',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const relationship = await entity_relationships.create(input as InsertEntityRelationship);
        toast.success('Relationship created', {
          description: `Created ${input.relationship_type} relationship`,
        });
        return {
          success: true,
          relationship,
          message: `Created relationship: ${input.relationship_type} (strength: ${input.strength})`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to create relationship', { description: errorMessage });
        throw new Error(`Failed to create relationship: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'get_entity_relationships',
    description: `Get all relationships for an entity (both incoming and outgoing).

Example:
{
  "entity_id": "uuid-here"
}`,
    inputSchema: {
      entity_id: z.string().uuid()
        .describe('The entity ID to get relationships for'),
    },
    annotations: {
      title: 'Get Entity Relationships',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const outgoing = await entity_relationships.get_outgoing(input.entity_id);
        const incoming = await entity_relationships.get_incoming(input.entity_id);

        return {
          entity_id: input.entity_id,
          outgoing: {
            count: outgoing.length,
            relationships: outgoing,
          },
          incoming: {
            count: incoming.length,
            relationships: incoming,
          },
          total: outgoing.length + incoming.length,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get relationships: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: 'delete_relationship',
    description: `Delete a relationship by ID.

Example:
{
  "id": "uuid-here"
}`,
    inputSchema: {
      id: z.string().uuid().describe('The relationship ID to delete'),
    },
    annotations: {
      title: 'Delete Relationship',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        await entity_relationships.remove(input.id);
        toast.success('Relationship deleted');
        return {
          success: true,
          message: `Deleted relationship: ${input.id}`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Failed to delete relationship', { description: errorMessage });
        throw new Error(`Failed to delete relationship: ${errorMessage}`);
      }
    },
  });
}
