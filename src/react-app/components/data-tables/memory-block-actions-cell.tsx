import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { memory_blocks } from "@/lib/db"
import { toast } from "sonner"
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
import type { MemoryBlock } from "./memory-blocks-columns"

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

export function ActionsCell({ block }: { block: MemoryBlock }) {
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
