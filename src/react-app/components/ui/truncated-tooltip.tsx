import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface TruncatedTooltipProps {
  /** The full text content to display */
  content: string
  /** Optional custom className for the text container */
  className?: string
  /** Maximum width for the tooltip content */
  maxWidth?: number
  /** Side of the tooltip relative to trigger */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Custom render function for the displayed text */
  children?: React.ReactNode
}

/**
 * A component that displays truncated text with a tooltip showing the full content.
 * Used in data tables and other contexts where space is limited.
 */
export function TruncatedTooltip({
  content,
  className,
  maxWidth = 300,
  side = 'top',
  children,
}: TruncatedTooltipProps) {
  // Don't show tooltip for very short content that won't be truncated
  const shouldShowTooltip = content.length > 30

  const displayContent = children ?? (
    <span className={cn("truncate", className)}>
      {content}
    </span>
  )

  if (!shouldShowTooltip) {
    return <>{displayContent}</>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default">
          {displayContent}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[var(--tooltip-max-width)] break-words"
        style={{ '--tooltip-max-width': `${maxWidth}px` } as React.CSSProperties}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

interface DateTooltipProps {
  /** The date to display */
  date: Date
  /** The formatted display text */
  displayText: string
  /** Optional custom className */
  className?: string
  /** Side of the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * A tooltip component specifically for displaying dates with full datetime on hover.
 */
export function DateTooltip({
  date,
  displayText,
  className,
  side = 'top',
}: DateTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("cursor-default", className)}>
          {displayText}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>
        {date.toLocaleString()}
      </TooltipContent>
    </Tooltip>
  )
}
