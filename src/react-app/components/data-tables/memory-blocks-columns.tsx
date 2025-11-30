"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Brain, ChevronRight } from "lucide-react"
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
import { memory_blocks } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { useState } from "react"
import { toast } from 'sonner'
import { EditableCell, EditableSelectCell } from "./editable-cell"

export type MemoryBlock = memory_blocks.GetAllMemoryBlocksResult

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
    toast.error('Failed to update', {
      id: loadingToast,
      description: error instanceof Error ? error.message : 'Please try again.',
    })
    throw error // Re-throw to let the editable cell handle it
  }
}

const handleDelete = async (id: string, label: string) => {
  const loadingToast = toast.loading('Deleting memory block...')

  try {
    await memory_blocks.remove(id)
    toast.success('Memory block deleted', {
      id: loadingToast,
      description: `"${label}" has been removed.`,
    })
  } catch (error) {
    toast.error('Failed to delete memory block', {
      id: loadingToast,
      description: error instanceof Error ? error.message : 'Please try again.',
    })
  }
}

function ActionsCell({ block }: { block: MemoryBlock }) {
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
              navigator.clipboard.writeText(block.id)
              toast.success('ID copied to clipboard')
            }}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{block.label}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(block.id, block.label)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const getBlockStyle = (blockType: string) => {
  const styles: Record<string, { color: string; bgColor: string }> = {
    user_profile: { color: 'text-brand', bgColor: 'bg-brand/10' },
    agent_persona: { color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
    current_goals: { color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
    context: { color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  }
  return styles[blockType] || styles.context
}

export const columns: ColumnDef<MemoryBlock>[] = [
  {
    id: "expander",
    header: () => null,
    size: 40,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <button
          onClick={row.getToggleExpandedHandler()}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
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
    accessorKey: "label",
    enableColumnFilter: true,
    enableGrouping: true,
    size: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start"
        >
          Label
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const block = row.original
      const style = getBlockStyle(block.block_type)

      return (
        <EditableCell
          value={block.label}
          onSave={(value) => handleUpdate(block.id, 'label', value)}
          displayComponent={
            <div className="flex items-center gap-2 min-w-0 max-w-[200px]">
              <div className={`h-7 w-7 rounded-lg ${style.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Brain className={`h-3.5 w-3.5 ${style.color}`} />
              </div>
              <span className="font-medium truncate" title={block.label}>{block.label}</span>
            </div>
          }
        />
      )
    },
  },
  {
    accessorKey: "block_type",
    enableColumnFilter: true,
    filterFn: "equals",
    enableGrouping: true,
    size: 150,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const block = row.original
      const blockType = block.block_type

      return (
        <EditableSelectCell
          value={blockType}
          options={blockTypeOptions}
          onSave={(value) => handleUpdate(block.id, 'block_type', value)}
          displayComponent={
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
              {blockType.replace(/_/g, ' ')}
            </span>
          }
        />
      )
    },
  },
  {
    accessorKey: "value",
    enableColumnFilter: true,
    header: "Content",
    size: 300,
    cell: ({ row }) => {
      const block = row.original
      const value = block.value

      return (
        <div className="max-w-[300px]">
          <EditableCell
            value={value}
            type="textarea"
            onSave={(newValue) => handleUpdate(block.id, 'value', newValue)}
            displayComponent={
              <div className="bg-muted rounded p-2">
                <p className="text-xs text-foreground leading-relaxed line-clamp-2" title={value}>
                  {value}
                </p>
              </div>
            }
          />
        </div>
      )
    },
  },
  {
    accessorKey: "priority",
    enableColumnFilter: true,
    filterFn: "inNumberRange",
    enableGrouping: true,
    enableHiding: true,
    size: 100,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const block = row.original

      return (
        <EditableCell
          value={block.priority}
          type="number"
          onSave={(value) => handleUpdate(block.id, 'priority', value)}
          displayComponent={<span className="text-sm">{block.priority}</span>}
        />
      )
    },
  },
  {
    id: "usage",
    header: "Usage",
    enableHiding: true,
    size: 140,
    cell: ({ row }) => {
      const block = row.original
      const percentage = Math.min((block.value.length / block.char_limit) * 100, 100)
      const isOverLimit = block.value.length > block.char_limit
      const isNearLimit = block.value.length > block.char_limit * 0.8

      return (
        <div className="space-y-1 min-w-[120px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {block.value.length}/{block.char_limit}
            </span>
            <span className={`font-medium ${
              isOverLimit ? 'text-destructive' : isNearLimit ? 'text-chart-1' : 'text-muted-foreground'
            }`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverLimit
                  ? 'bg-destructive'
                  : isNearLimit
                  ? 'bg-chart-1'
                  : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "updated_at",
    size: 120,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"))
      const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000 // Less than 7 days

      return (
        <span className="text-xs text-muted-foreground whitespace-nowrap" title={date.toLocaleString()}>
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
    cell: ({ row }) => <ActionsCell block={row.original} />,
  },
]
