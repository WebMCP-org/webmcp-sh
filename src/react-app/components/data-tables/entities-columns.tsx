"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ChevronRight, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { memory_entities } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { Lightbulb, Heart, Code, AlertCircle, User, FolderOpen, Target, BookOpen } from 'lucide-react'
import { useState } from "react"
import { toast } from 'sonner'
import { EditableCell, EditableSelectCell } from "./editable-cell"

export type Entity = memory_entities.GetAllMemoryEntitiesResult

const categoryOptions = [
  { value: 'fact', label: 'Fact' },
  { value: 'preference', label: 'Preference' },
  { value: 'skill', label: 'Skill' },
  { value: 'rule', label: 'Rule' },
  { value: 'context', label: 'Context' },
  { value: 'person', label: 'Person' },
  { value: 'project', label: 'Project' },
  { value: 'goal', label: 'Goal' },
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

const categoryIcons: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  fact: { icon: Lightbulb, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  preference: { icon: Heart, color: 'text-brand', bgColor: 'bg-brand/10' },
  skill: { icon: Code, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  rule: { icon: AlertCircle, color: 'text-brand', bgColor: 'bg-brand/10' },
  context: { icon: BookOpen, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  person: { icon: User, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  project: { icon: FolderOpen, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  goal: { icon: Target, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
}

const handleDelete = async (id: string, name: string) => {
  const loadingToast = toast.loading('Deleting entity...')

  try {
    await memory_entities.remove(id)
    toast.success('Entity deleted', {
      id: loadingToast,
      description: `"${name}" has been removed from your knowledge base.`,
    })
  } catch (error) {
    console.error('Failed to delete entity:', error)
    toast.error('Failed to delete entity', {
      id: loadingToast,
      description: error instanceof Error ? error.message : 'Please try again.',
    })
  }
}

function ActionsCell({ entity }: { entity: Entity }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(entity.id)
              toast.success('ID copied to clipboard')
            }}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/entities/$entityId" params={{ entityId: entity.id }}>
              View details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{entity.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(entity.id, entity.name)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const columns: ColumnDef<Entity>[] = [
  {
    id: "expander",
    header: () => null,
    size: 40,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="cursor-pointer text-gray-600 hover:text-gray-900:text-gray-100"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              row.getIsExpanded() ? "rotate-90" : ""
            }`}
          />
        </button>
      )
    },
  },
  {
    accessorKey: "name",
    enableGrouping: true,
    enableColumnFilter: true,
    size: 220,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const entity = row.original
      const categoryConfig = categoryIcons[entity.category] || categoryIcons.context
      const Icon = categoryConfig.icon

      return (
        <EditableCell
          value={entity.name}
          onSave={(value: string | number) => handleUpdate(entity.id, 'name', value)}
          displayComponent={
            <div className="flex items-center gap-2 min-w-0 max-w-[220px]">
              <div className={`h-7 w-7 rounded-lg ${categoryConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${categoryConfig.color}`} />
              </div>
              <Link
                to="/entities/$entityId"
                params={{ entityId: entity.id }}
                className="hover:underline truncate font-medium"
                title={entity.name}
              >
                {entity.name}
              </Link>
            </div>
          }
        />
      )
    },
  },
  {
    accessorKey: "category",
    enableGrouping: true,
    enableColumnFilter: true,
    filterFn: "equals",
    size: 120,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const entity = row.original

      return (
        <EditableSelectCell
          value={entity.category}
          options={categoryOptions}
          onSave={(value: string) => handleUpdate(entity.id, 'category', value)}
          displayComponent={
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize whitespace-nowrap">
              {entity.category}
            </span>
          }
        />
      )
    },
  },
  {
    accessorKey: "description",
    enableColumnFilter: true,
    header: "Description",
    size: 300,
    cell: ({ row }) => {
      const entity = row.original

      return (
        <div className="max-w-[300px]">
          <EditableCell
            value={entity.description}
            type="textarea"
            onSave={(value: string | number) => handleUpdate(entity.id, 'description', value)}
            displayComponent={
              <div className="truncate text-sm text-gray-600" title={entity.description}>
                {entity.description}
              </div>
            }
          />
        </div>
      )
    },
  },
  {
    accessorKey: "tags",
    enableColumnFilter: true,
    header: "Tags",
    size: 160,
    filterFn: (row, columnId, filterValue) => {
      const tags = row.getValue(columnId) as string[]
      if (!tags || tags.length === 0) return false
      return tags.some(tag =>
        tag.toLowerCase().includes(filterValue.toLowerCase())
      )
    },
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[]
      if (!tags || tags.length === 0) return null

      return (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
              +{tags.length - 2}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "confidence",
    filterFn: "inNumberRange",
    size: 100,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Confidence
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const entity = row.original

      return (
        <EditableCell
          value={entity.confidence}
          type="number"
          onSave={(value: string | number) => handleUpdate(entity.id, 'confidence', value)}
          displayComponent={<span className="text-sm whitespace-nowrap">{entity.confidence}%</span>}
        />
      )
    },
  },
  {
    accessorKey: "mention_count",
    filterFn: "inNumberRange",
    size: 100,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mentions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue("mention_count")}</span>
    },
  },
  {
    accessorKey: "importance_score",
    enableGrouping: true,
    enableColumnFilter: true,
    filterFn: "inNumberRange",
    size: 140,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Importance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const entity = row.original

      return (
        <EditableCell
          value={entity.importance_score}
          type="number"
          onSave={(value: string | number) => handleUpdate(entity.id, 'importance_score', value)}
          displayComponent={
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className="h-full bg-brand rounded-full"
                  style={{ width: `${entity.importance_score}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{entity.importance_score}</span>
            </div>
          }
        />
      )
    },
  },
  {
    accessorKey: "last_mentioned",
    size: 120,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Mentioned
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("last_mentioned"))
      const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000 // Less than 7 days

      return (
        <span className="text-xs text-gray-600 whitespace-nowrap" title={date.toLocaleString()}>
          {isRecent
            ? formatDistanceToNow(date, { addSuffix: true })
            : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          }
        </span>
      )
    },
  },
  {
    id: "actions",
    size: 60,
    enableResizing: false,
    cell: ({ row }) => <ActionsCell entity={row.original} />,
  },
]
