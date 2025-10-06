import { HelpCircle, Info } from 'lucide-react'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  content: string | React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
  iconClassName?: string
  variant?: 'help' | 'info'
  maxWidth?: string
}

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

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <Icon
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/70 cursor-help hover:text-muted-foreground transition-colors inline-block",
              iconClassName
            )}
          />
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={5}
            className={cn(
              "z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              "rounded-lg border bg-slate-900 px-4 py-3 text-white shadow-lg",
              className
            )}
            style={{ maxWidth }}
          >
            <div className="space-y-2 text-xs leading-relaxed [&_p.font-semibold]:text-blue-400 [&_p.font-semibold]:font-bold [&_p.font-semibold]:mb-1 [&_p.text-muted-foreground]:text-slate-400 [&_p.text-muted-foreground]:text-[11px] [&_p.text-muted-foreground]:mt-2">
              {content}
            </div>
            <TooltipPrimitive.Arrow className="fill-slate-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}