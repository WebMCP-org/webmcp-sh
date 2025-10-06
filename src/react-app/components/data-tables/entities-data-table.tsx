"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { DataTable } from "./data-table"
import { Entity } from "./entities-columns"
import { EditableCell, EditableSelectCell } from "./editable-cell"
import { memory_entities } from '@/lib/db'
import { toast } from 'sonner'
import type { TableToolsConfig } from "@/hooks/useMCPTableTools"

interface EntitiesDataTableProps<TData extends Record<string, unknown>, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  mcpTools?: Omit<TableToolsConfig<TData>, 'data' | 'table' | 'columnFilters' | 'setColumnFilters' |
    'sorting' | 'setSorting' | 'globalFilter' | 'setGlobalFilter' |
    'columnVisibility' | 'setColumnVisibility' | 'pagination' | 'setPagination'>
}

export function EntitiesDataTable<TData extends Record<string, unknown>, TValue>({
  columns,
  data,
  mcpTools,
}: EntitiesDataTableProps<TData, TValue>) {
  const memoryTierOptions = [
    { value: 'short_term', label: 'Short Term' },
    { value: 'working', label: 'Working' },
    { value: 'long_term', label: 'Long Term' },
    { value: 'archived', label: 'Archived' },
  ]

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    const loadingToast = toast.loading('Updating entity...')

    try {
      await memory_entities.update_field(id, field, value)
      toast.success('Updated successfully', {
        id: loadingToast,
      })
    } catch (error) {
      console.error('Failed to update entity:', error)
      toast.error('Failed to update', {
        id: loadingToast,
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      throw error
    }
  }

  const renderExpandedRow = (row: Row<TData>) => {
    const entity = row.original as Entity

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <div className="h-1 w-1 rounded-full bg-brand"></div>
            <h4 className="font-semibold text-sm text-gray-900">Entity Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <p className="font-mono text-xs text-gray-900 break-all">{entity.id}</p>
              </div>
            </div>

            {/* Source Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Source Type</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900">{entity.source_type || 'N/A'}</p>
              </div>
            </div>

            {/* Memory Tier - Editable */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Memory Tier</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <EditableSelectCell
                  value={entity.memory_tier}
                  options={memoryTierOptions}
                  onSave={(value) => handleUpdate(entity.id, 'memory_tier', value)}
                  displayComponent={
                    <p className="text-sm text-gray-900 capitalize">{entity.memory_tier.replace(/_/g, ' ')}</p>
                  }
                />
              </div>
            </div>

            {/* Current Strength - Editable */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Strength</label>
              <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                <EditableCell
                  value={entity.current_strength}
                  type="number"
                  onSave={(value) => handleUpdate(entity.id, 'current_strength', value)}
                  displayComponent={
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand to-purple-500 rounded-full transition-all"
                          style={{ width: `${entity.current_strength}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{entity.current_strength}/100</span>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Full Description - Editable */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Description</label>
              <div className="px-4 py-3 bg-white rounded-lg border border-gray-200">
                <EditableCell
                  value={entity.description}
                  type="textarea"
                  onSave={(value) => handleUpdate(entity.id, 'description', value)}
                  displayComponent={
                    <p className="text-sm text-gray-900 leading-relaxed">{entity.description}</p>
                  }
                />
              </div>
            </div>

            {/* Tags */}
            {entity.tags.length > 0 && (
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">All Tags</label>
                <div className="flex flex-wrap gap-2">
                  {entity.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
      mcpTools={mcpTools || { tableName: 'entities', tableDescription: 'Entities table' }}
    />
  )
}
