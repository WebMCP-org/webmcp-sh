"use client"

import { useState, useRef } from "react"
import { ColumnDef, Table as TableInstance } from "@tanstack/react-table"
import { MemoryBlocksDataTable } from "./memory-blocks-data-table"
import { useMCPTableTools } from "@/hooks/useMCPTableTools"
import { memory_blocks } from '@/lib/db'
import { toast } from 'sonner'

interface MemoryBlocksTableWithToolsProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function MemoryBlocksTableWithTools<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
}: MemoryBlocksTableWithToolsProps<TData, TValue>) {
  const [selectedBlock, setSelectedBlock] = useState<TData | null>(null)
  const tableRef = useRef<TableInstance<TData> | null>(null)

  // Register MCP table tools for memory blocks
  useMCPTableTools({
    tableName: 'memory_blocks',
    tableDescription: 'Always-in-context memory blocks that are core to the AI system',
    data: data,
    selectedItem: selectedBlock,
    onSelectItem: setSelectedBlock,
    table: tableRef.current || undefined,
    searchableFields: ['content', 'name'],
    getItemId: (item) => item.id as string,
    getItemDisplayName: (item) => {
      const blockType = item.block_type as string;
      const name = item.name as string | undefined;
      const content = item.content as string;
      return `${blockType}: ${name || content.substring(0, 30)}`;
    },
    customActions: {
      update_priority: {
        description: 'Update the priority of a memory block',
        handler: async (item) => {
          const currentPriority = item.priority as number;
          const newPriority = currentPriority === 1 ? 5 : currentPriority === 5 ? 10 : 1;
          await memory_blocks.update({ id: item.id as string, priority: newPriority });
          toast.success(`Updated priority to ${newPriority}`);
          return `Priority updated to ${newPriority}`;
        }
      },
      // Note: is_active field doesn't exist in memory_blocks schema
      // toggle_active: {
      //   description: 'Toggle whether a memory block is active',
      //   handler: async (item) => {
      //     const isActive = item.is_active as boolean;
      //     await memory_blocks.update({ id: item.id as string, is_active: !isActive });
      //     toast.success(`Block ${isActive ? 'deactivated' : 'activated'}`);
      //     return `Memory block ${isActive ? 'deactivated' : 'activated'}`;
      //   }
      // },
      delete_block: {
        description: 'Delete a memory block',
        handler: async (item) => {
          await memory_blocks.remove(item.id as string);
          if (selectedBlock?.id === item.id) {
            setSelectedBlock(null);
          }
          toast.success('Memory block deleted');
          return 'Memory block deleted successfully';
        }
      },
      duplicate_block: {
        description: 'Create a duplicate of this memory block',
        handler: async (item) => {
          const newBlock = await memory_blocks.create({
            block_type: item.block_type as 'user_profile' | 'agent_persona' | 'current_goals' | 'context',
            value: item.value as string,
            label: item.label ? `${item.label as string} (Copy)` : 'Copy',
            char_limit: (item.char_limit as number) || 500,
            priority: item.priority as number,
            metadata: item.metadata as Record<string, unknown> | undefined
          });
          toast.success('Memory block duplicated');
          return `Created duplicate with ID: ${newBlock.id}`;
        }
      }
    }
  });

  // Pass the table instance to our ref when it's available
  const onTableReady = (table: TableInstance<TData>) => {
    tableRef.current = table;
  };

  return (
    <MemoryBlocksDataTable
      columns={columns}
      data={data}
      // @ts-expect-error - Table types are complex
      onTableReady={onTableReady}
    />
  );
}