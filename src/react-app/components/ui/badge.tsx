import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-zinc-800 shadow-sm",
        secondary:
          "bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-900 border-zinc-300 shadow-sm",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-600 shadow-sm",
        outline:
          "text-zinc-700 border-zinc-300 bg-white hover:bg-zinc-50",
        success:
          "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 shadow-sm",
        warning:
          "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-amber-600 shadow-sm",
        info:
          "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-sm",
        glass:
          "bg-zinc-100/50 backdrop-blur-md border-zinc-200 text-zinc-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }