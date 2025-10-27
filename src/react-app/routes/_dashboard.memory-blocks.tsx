import { createFileRoute } from '@tanstack/react-router'
import { Brain, Plus } from 'lucide-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { memory_blocks } from '@/lib/db'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MemoryBlockForm } from '@/components/forms/memory-block-form'
import { MemoryBlocksDataTable } from '@/components/data-tables/memory-blocks-data-table'
import { columns } from '@/components/data-tables/memory-blocks-columns'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { tooltips } from '@/lib/tooltip-content'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { MCPToolsConfig } from '@/types/mcp-tools'
import type { UpdateMemoryBlock } from '@/lib/db/schema'

export const Route = createFileRoute('/_dashboard/memory-blocks')({
  component: MemoryBlocksComponent,
})

function MemoryBlocksComponent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<memory_blocks.GetAllMemoryBlocksResult | null>(null)
  const [editingBlock, setEditingBlock] = useState<memory_blocks.GetAllMemoryBlocksResult | null>(null)
  const [duplicateData, setDuplicateData] = useState<UpdateMemoryBlock | null>(null)

  const blocksQuery = memory_blocks.getAllMemoryBlocksQuerySQL()
  const blocksResult = useLiveQuery<memory_blocks.GetAllMemoryBlocksResult>(blocksQuery.sql, blocksQuery.params)
  const blocks = blocksResult?.rows ?? []

  const mcpToolsConfig: MCPToolsConfig<memory_blocks.GetAllMemoryBlocksResult> = {
    tableName: 'memory_blocks',
    tableDescription: 'Always-in-context memory blocks that are core to the AI system',
    selectedItem: selectedBlock,
    onSelectItem: setSelectedBlock,
    searchableFields: ['value', 'label'],
    getItemId: (item: memory_blocks.GetAllMemoryBlocksResult) => item.id,
    getItemDisplayName: (item: memory_blocks.GetAllMemoryBlocksResult) => `${item.block_type}: ${item.label || item.value.substring(0, 30)}`,
    customActions: {
      edit_block: {
        description: 'Open the edit dialog for this memory block',
        handler: async (item) => {
          setEditingBlock(item)
          setIsEditDialogOpen(true)
          return `Opening edit dialog for ${item.label}`
        }
      },
      duplicate_block: {
        description: 'Open the create dialog with pre-filled data from this block',
        handler: async (item) => {
          setDuplicateData({
            block_type: item.block_type,
            value: item.value,
            label: `${item.label} (Copy)`,
            priority: item.priority,
            char_limit: item.char_limit,
            metadata: item.metadata
          } as UpdateMemoryBlock)
          setIsDuplicateDialogOpen(true)
          return `Opening duplicate dialog for ${item.label}`
        }
      },
      select_block: {
        description: 'Select this memory block in the UI',
        handler: async (item) => {
          setSelectedBlock(item)
          return `Selected ${item.label}`
        }
      },
      filter_by_type: {
        description: 'Filter the table to show only this block type',
        handler: async (item) => {
          return `Would filter by ${item.block_type} (not yet implemented)`
        }
      }
    }
  }

  return (
    <TooltipProvider>
    <div className="h-full w-full flex flex-col bg-background">
      <div className="flex-shrink-0 border-b border-divide bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand" />
              Memory Blocks
              <InfoTooltip content={tooltips.pageHeaders.memoryBlocks} />
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Always-in-context memory</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-divide">
                <DialogTitle>Create Memory Block</DialogTitle>
                <DialogDescription>
                  Add a new always-in-context memory block to your system.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-6 py-4">
                <MemoryBlockForm
                  onSuccess={() => setIsCreateDialogOpen(false)}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-divide">
                <DialogTitle>Edit Memory Block</DialogTitle>
                <DialogDescription>
                  Update the details of this memory block.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-6 py-4">
                {editingBlock && (
                  <MemoryBlockForm
                    block={{
                      id: editingBlock.id,
                      block_type: editingBlock.block_type,
                      label: editingBlock.label,
                      value: editingBlock.value,
                      priority: editingBlock.priority,
                      char_limit: editingBlock.char_limit,
                      metadata: editingBlock.metadata,
                    }}
                    onSuccess={() => {
                      setIsEditDialogOpen(false)
                      setEditingBlock(null)
                    }}
                    onCancel={() => {
                      setIsEditDialogOpen(false)
                      setEditingBlock(null)
                    }}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-divide">
                <DialogTitle>Duplicate Memory Block</DialogTitle>
                <DialogDescription>
                  Create a new block based on an existing one.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-6 py-4">
                {duplicateData && (
                  <MemoryBlockForm
                    block={duplicateData}
                    onSuccess={() => {
                      setIsDuplicateDialogOpen(false)
                      setDuplicateData(null)
                    }}
                    onCancel={() => {
                      setIsDuplicateDialogOpen(false)
                      setDuplicateData(null)
                    }}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <MemoryBlocksDataTable columns={columns} data={blocks} mcpTools={mcpToolsConfig} />
      </div>
    </div>
    </TooltipProvider>
  )
}
