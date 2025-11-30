import { createFileRoute } from '@tanstack/react-router'
import { Database, Plus, Lightbulb, Heart, Code, AlertCircle, User, FolderOpen, Target, BookOpen, type LucideIcon } from 'lucide-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { memory_entities } from '@/lib/db'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MemoryEntityForm } from '@/components/forms/memory-entity-form'
import { EntitiesDataTable } from '@/components/data-tables/entities-data-table'
import { columns } from '@/components/data-tables/entities-columns'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { tooltips } from '@/lib/tooltip-content'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from '@tanstack/react-router'
import type { MCPToolsConfig } from '@/types/mcp-tools'
import type { InsertMemoryEntity, UpdateMemoryEntity } from '@/lib/db/types'

export const Route = createFileRoute('/_dashboard/entities')({
  component: EntitiesComponent,
})

const categoryIcons: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  fact: { icon: Lightbulb, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  preference: { icon: Heart, color: 'text-primary', bgColor: 'bg-primary/10' },
  skill: { icon: Code, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  rule: { icon: AlertCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
  context: { icon: BookOpen, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  person: { icon: User, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  project: { icon: FolderOpen, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  goal: { icon: Target, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
}

function EntitiesComponent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<memory_entities.GetAllMemoryEntitiesResult | null>(null)
  const [editingEntity, setEditingEntity] = useState<memory_entities.GetAllMemoryEntitiesResult | null>(null)
  const [duplicateData, setDuplicateData] = useState<Partial<InsertMemoryEntity> | null>(null)
  const router = useRouter()

  const entitiesQuery = memory_entities.getAllMemoryEntitiesQuerySQL()
  const entitiesResult = useLiveQuery<memory_entities.GetAllMemoryEntitiesResult>(entitiesQuery.sql, entitiesQuery.params)

  const categoryCountsQuery = memory_entities.getMemoryEntityCategoryCountsQuerySQL()
  const categoryCountsResult = useLiveQuery<memory_entities.GetMemoryEntityCategoryCountsResult>(categoryCountsQuery.sql, categoryCountsQuery.params)

  const entities = entitiesResult?.rows ?? []
  const categoryCounts = categoryCountsResult?.rows ?? []

  const filteredEntities = selectedCategory === 'all'
    ? entities
    : entities.filter((entity) => entity.category === selectedCategory)

  const totalCount = entities.length

  // MCP Tools configuration to pass to the DataTable
  const mcpToolsConfig: MCPToolsConfig<memory_entities.GetAllMemoryEntitiesResult> = {
    tableName: 'entities',
    tableDescription: 'Structured knowledge entities (facts, preferences, skills, people, projects, goals)',
    selectedItem: selectedEntity,
    onSelectItem: setSelectedEntity,
    searchableFields: ['name', 'description', 'tags'],
    getItemId: (item: memory_entities.GetAllMemoryEntitiesResult) => item.id,
    getItemDisplayName: (item: memory_entities.GetAllMemoryEntitiesResult) => `${item.name} (${item.category})`,
    customActions: {
      view_details: {
        description: 'Navigate to the entity details page',
        handler: async (item) => {
          await router.navigate({ to: '/entities/$entityId', params: { entityId: item.id } })
          return `Navigated to entity details page for ${item.name}`
        }
      },
      edit_entity: {
        description: 'Open the edit dialog for this entity',
        handler: async (item) => {
          setEditingEntity(item)
          setIsEditDialogOpen(true)
          return `Opening edit dialog for ${item.name}`
        }
      },
      duplicate_entity: {
        description: 'Open the create dialog with pre-filled data from this entity',
        handler: async (item) => {
          setDuplicateData({
            category: item.category,
            name: `${item.name} (Copy)`,
            description: item.description,
            tags: item.tags || [],
            confidence: item.confidence || 100,
            importance_score: item.importance_score || 50
          })
          setIsDuplicateDialogOpen(true)
          return `Opening duplicate dialog for ${item.name}`
        }
      },
      select_entity: {
        description: 'Select this entity in the UI',
        handler: async (item) => {
          setSelectedEntity(item)
          return `Selected ${item.name}`
        }
      },
      filter_by_category: {
        description: 'Filter the table to show only this entity\'s category',
        handler: async (item) => {
          setSelectedCategory(item.category)
          return `Filtered table to show only ${item.category} entities`
        }
      },
      clear_filters: {
        description: 'Clear all filters and show all entities',
        handler: async () => {
          setSelectedCategory('all')
          return 'Cleared all filters'
        }
      }
    }
  }

  return (
    <TooltipProvider>
    <div className="h-full w-full min-w-0 flex flex-col bg-background">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-divide bg-card px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
              <Database className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Entities</span>
              <InfoTooltip content={tooltips.pageHeaders.entities} />
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Structured knowledge</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all flex-shrink-0 text-xs md:text-sm"
              >
                <Plus className="h-3 w-3 md:mr-1" />
                <span className="hidden md:inline">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 mx-2 md:mx-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-divide">
                <DialogTitle>Create Memory Entity</DialogTitle>
                <DialogDescription>
                  Add a new structured piece of knowledge to your memory system.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-6 py-4">
                <MemoryEntityForm
                  onSuccess={() => setIsCreateDialogOpen(false)}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-divide">
                <DialogTitle>Edit Memory Entity</DialogTitle>
                <DialogDescription>
                  Update the details of this memory entity.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-6 py-4">
                {editingEntity && (
                  <MemoryEntityForm
                    entity={{
                      id: editingEntity.id,
                      category: editingEntity.category,
                      name: editingEntity.name,
                      description: editingEntity.description,
                      tags: editingEntity.tags,
                      confidence: editingEntity.confidence,
                      importance_score: editingEntity.importance_score,
                    }}
                    onSuccess={() => {
                      setIsEditDialogOpen(false)
                      setEditingEntity(null)
                    }}
                    onCancel={() => {
                      setIsEditDialogOpen(false)
                      setEditingEntity(null)
                    }}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Duplicate Dialog */}
          <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-divide">
                <DialogTitle>Duplicate Memory Entity</DialogTitle>
                <DialogDescription>
                  Create a new entity based on an existing one.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-6 py-4">
                {duplicateData && (
                  <MemoryEntityForm
                    entity={duplicateData as UpdateMemoryEntity}
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

      {/* Category Filters */}
      <div className="flex-shrink-0 border-b border-divide px-3 md:px-6 py-2 md:py-3">
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all duration-150 whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
            }`}
          >
            All ({totalCount})
          </button>
          {Object.entries(categoryIcons).map(([category, { icon: Icon }]) => {
            const categoryCount = categoryCounts.find((c) => c.category === category)?.count ?? 0
            return (
              <Tooltip key={category}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all duration-150 flex items-center gap-1 md:gap-1.5 whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    <Icon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="hidden sm:inline">{category}</span>
                    <span className="sm:hidden">{category.slice(0, 3)}</span>
                    <span>({categoryCount})</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {tooltips.categories[category as keyof typeof tooltips.categories]}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>

      {/* Data Table Container - Single scroll container */}
      <div className="flex-1 overflow-auto p-3 md:p-6">
        <EntitiesDataTable columns={columns} data={filteredEntities} mcpTools={mcpToolsConfig} />
      </div>
    </div>
    </TooltipProvider>
  )
}
