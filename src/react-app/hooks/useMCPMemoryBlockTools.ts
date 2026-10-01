import { useWebMCP } from '@mcp-b/react-webmcp';
import { toast } from 'sonner';
import { memory_blocks } from '@/lib/db';
import type { InsertMemoryBlock } from '@/lib/db/types';

/**
 * Hook to register memory block CRUD MCP tools
 *
 * Provides AI agents with direct CRUD operations for memory blocks
 * (always-in-context core memories).
 *
 * Should be called in the memory-blocks route component.
 */
export function useMCPMemoryBlockTools() {
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
      type: 'object',
      properties: {
        block_type: {
          type: 'string',
          enum: ['user_profile', 'agent_persona', 'current_goals', 'context'],
          description: 'Type of memory block',
        },
        label: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Human-readable label for the block',
        },
        value: { type: 'string', minLength: 1, description: 'The actual memory content' },
        priority: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
          default: 50,
          description: 'Priority (0-100, higher = more important)',
        },
        char_limit: {
          type: 'integer',
          minimum: 1,
          default: 500,
          description: 'Maximum character limit for this block',
        },
        metadata: {
          type: 'object',
          additionalProperties: true,
          description: 'Optional structured metadata',
        },
      },
      required: ['block_type', 'label', 'value'],
    } as const,
    annotations: {
      title: 'Create Memory Block',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
        const block = await memory_blocks.create({
          priority: 50,
          char_limit: 500,
          ...input,
        } as InsertMemoryBlock);
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
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'The memory block ID to update' },
        block_type: {
          type: 'string',
          enum: ['user_profile', 'agent_persona', 'current_goals', 'context'],
          description: 'New block type',
        },
        label: { type: 'string', minLength: 1, maxLength: 200, description: 'New label' },
        value: { type: 'string', minLength: 1, description: 'New content' },
        priority: { type: 'integer', minimum: 0, maximum: 100, description: 'New priority' },
        char_limit: { type: 'integer', minimum: 1, description: 'New character limit' },
        metadata: { type: 'object', additionalProperties: true, description: 'New metadata' },
      },
      required: ['id'],
    } as const,
    annotations: {
      title: 'Update Memory Block',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
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
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'The memory block ID to delete' },
      },
      required: ['id'],
    } as const,
    annotations: {
      title: 'Delete Memory Block',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
      try {
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
      type: 'object',
      properties: {
        block_type: {
          type: 'string',
          enum: ['user_profile', 'agent_persona', 'current_goals', 'context'],
          description: 'Filter by block type',
        },
      },
    } as const,
    annotations: {
      title: 'List Memory Blocks',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (input) => {
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
}
