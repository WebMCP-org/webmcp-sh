"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { DataTable } from "./data-table"
import { MemoryBlock } from "./memory-blocks-columns"
import { EditableCell, EditableSelectCell } from "./editable-cell"
import { memory_blocks } from '@/lib/db'
import { toast } from 'sonner'

import type { TableToolsConfig } from "@/hooks/useMCPTableTools"

interface MemoryBlocksDataTableProps<TData extends Record<string, unknown>, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  mcpTools?: Omit<TableToolsConfig<TData>, 'data' | 'table' | 'columnFilters' | 'setColumnFilters' |
    'sorting' | 'setSorting' | 'globalFilter' | 'setGlobalFilter' |
    'columnVisibility' | 'setColumnVisibility' | 'pagination' | 'setPagination'>
}

export function MemoryBlocksDataTable<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
  mcpTools,
}: MemoryBlocksDataTableProps<TData, TValue>) {
  // Set default column visibility - hide some columns to prevent overflow
  const defaultColumnVisibility = {
    priority: false,
    usage: false,
  }

  const blockTypeOptions = [
    { value: 'user_profile', label: 'User Profile' },
    { value: 'agent_persona', label: 'Agent Persona' },
    { value: 'current_goals', label: 'Current Goals' },
    { value: 'context', label: 'Context' },
  ]

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    const loadingToast = toast.loading('Updating memory block...')

    try {
      await memory_blocks.update_field(id, field, value)
      toast.success('Updated successfully', {
        id: loadingToast,
      })
    } catch (error) {
      console.error('Failed to update memory block:', error)
      toast.error('Failed to update', {
        id: loadingToast,
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      throw error
    }
  }

  const renderExpandedRow = (row: Row<TData>) => {
    const block = row.original as MemoryBlock
    const usagePercentage = Math.round((block.value.length / block.char_limit) * 100)
    const isOverLimit = block.value.length > block.char_limit
    const isNearLimit = usagePercentage > 80

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <div className="h-1 w-1 rounded-full bg-brand"></div>
            <h4 className="font-semibold text-sm text-gray-900">Memory Block Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ID */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <p className="font-mono text-xs text-gray-900 break-all">{block.id}</p>
              </div>
            </div>

            {/* Block Type - Editable */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Block Type</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <EditableSelectCell
                  value={block.block_type}
                  options={blockTypeOptions}
                  onSave={(value) => handleUpdate(block.id, 'block_type', value)}
                  displayComponent={
                    <p className="text-sm text-gray-900 capitalize">{block.block_type.replace(/_/g, ' ')}</p>
                  }
                />
              </div>
            </div>

            {/* Token Cost */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Token Cost</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900">{block.token_cost} tokens</p>
              </div>
            </div>

            {/* Character Limit - Editable */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Character Limit</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <EditableCell
                  value={block.char_limit}
                  type="number"
                  onSave={(value) => handleUpdate(block.id, 'char_limit', value)}
                  displayComponent={
                    <p className="text-sm text-gray-900">{block.char_limit.toLocaleString()}</p>
                  }
                />
              </div>
            </div>

            {/* Current Usage */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Usage</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{block.value.length.toLocaleString()} / {block.char_limit.toLocaleString()} chars</span>
                    <span className={`font-medium ${
                      isOverLimit ? 'text-red-600' :
                      isNearLimit ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {usagePercentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverLimit
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : isNearLimit
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-brand to-purple-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusion Priority - Editable */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inclusion Priority</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <EditableCell
                  value={block.inclusion_priority}
                  type="number"
                  onSave={(value) => handleUpdate(block.id, 'inclusion_priority', value)}
                  displayComponent={
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand to-purple-500 rounded-full transition-all"
                          style={{ width: `${block.inclusion_priority}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{block.inclusion_priority}</span>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Last Accessed */}
            {block.last_accessed && (
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Accessed</label>
                <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900">{new Date(block.last_accessed).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Full Content - Editable */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Content</label>
              <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <EditableCell
                  value={block.value}
                  type="textarea"
                  onSave={(value) => handleUpdate(block.id, 'value', value)}
                  displayComponent={
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{block.value}</p>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      renderExpandedRow={renderExpandedRow}
      defaultColumnVisibility={defaultColumnVisibility}
      mcpTools={mcpTools || { tableName: 'memory_blocks', tableDescription: 'Memory blocks table' }}
    />
  )
}
