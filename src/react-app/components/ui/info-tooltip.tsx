import { HelpCircle, Info } from 'lucide-react'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface InfoTooltipProps {
  content: string | React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
  iconClassName?: string
  variant?: 'help' | 'info'
  maxWidth?: string
}

const contentStyles = "z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-lg border border-border bg-popover px-4 py-3 text-popover-foreground shadow-lg"

const innerContentStyles = "space-y-2 text-xs leading-relaxed [&_p.font-semibold]:text-primary [&_p.font-semibold]:font-bold [&_p.font-semibold]:mb-1 [&_p.text-muted-foreground]:text-muted-foreground [&_p.text-muted-foreground]:text-[11px] [&_p.text-muted-foreground]:mt-2"

export function InfoTooltip({
  content,
  side = 'top',
  align = 'center',
  className,
  iconClassName,
  variant = 'help',
  maxWidth = '320px'
}: InfoTooltipProps) {
  const Icon = variant === 'help' ? HelpCircle : Info
  const isMobile = useIsMobile()

  const triggerButton = (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        iconClassName
      )}
    >
      <Icon
        className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        aria-hidden="true"
      />
      <span className="sr-only">More information</span>
    </button>
  )

  // Mobile: Use Popover (click/tap to open)
  if (isMobile) {
    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          {triggerButton}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side={side}
            align={align}
            sideOffset={5}
            className={cn(contentStyles, className)}
            style={{ maxWidth }}
          >
            <div className={innerContentStyles}>
              {content}
            </div>
            <PopoverPrimitive.Arrow className="fill-popover" />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }

  // Desktop: Use Tooltip (hover to open)
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {triggerButton}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={5}
            className={cn(contentStyles, className)}
            style={{ maxWidth }}
          >
            <div className={innerContentStyles}>
              {content}
            </div>
            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}