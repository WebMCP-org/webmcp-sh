"use client"

import * as React from "react"
import { Check, X, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface EditableCellProps {
  value: string | number
  onSave: (value: string | number) => Promise<void>
  type?: "text" | "textarea" | "number"
  className?: string
  displayComponent?: React.ReactNode
}

export function EditableCell({
  value,
  onSave,
  type = "text",
  className,
  displayComponent,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
      toast.success("Value updated successfully")
    } catch (error) {
      setEditValue(value) // Reset on error
      toast.error("Failed to update value", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full">
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] text-xs"
            autoFocus
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) =>
              setEditValue(
                type === "number" ? e.target.valueAsNumber : e.target.value
              )
            }
            onKeyDown={handleKeyDown}
            className={cn("h-8 text-xs", className)}
            autoFocus
          />
        )}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-3.5 w-3.5 text-chart-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group flex items-center gap-2 cursor-pointer hover:bg-muted rounded px-2 py-1 -mx-2 -my-1 transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex-1 min-w-0">
        {displayComponent || (
          <span className={cn("text-sm", className)}>{value}</span>
        )}
      </div>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
    </div>
  )
}

interface EditableSelectCellProps {
  value: string
  options: { value: string; label: string }[]
  onSave: (value: string) => Promise<void>
  displayComponent?: React.ReactNode
}

export function EditableSelectCell({
  value,
  options,
  onSave,
  displayComponent,
}: EditableSelectCellProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async (newValue: string) => {
    if (newValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(newValue)
      setIsEditing(false)
      toast.success("Value updated successfully")
    } catch (error) {
      // Save failed, keep editing
      toast.error("Failed to update value", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={handleSave} disabled={isSaving}>
          <SelectTrigger className="h-8 text-xs" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          <X className="h-3.5 w-3.5 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="group flex items-center gap-2 cursor-pointer hover:bg-muted rounded px-2 py-1 -mx-2 -my-1 transition-colors"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex-1 min-w-0">
        {displayComponent || <span className="text-sm">{value}</span>}
      </div>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
    </div>
  )
}
