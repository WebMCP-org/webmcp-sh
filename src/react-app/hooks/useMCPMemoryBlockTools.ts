import { z } from 'zod';
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
}
