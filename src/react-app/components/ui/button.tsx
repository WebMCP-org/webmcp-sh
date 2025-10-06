import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-lg hover:shadow-xl border border-zinc-800 hover:from-zinc-800 hover:to-zinc-700",
        destructive:
          "bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl border border-red-700",
        outline:
          "border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 shadow-sm hover:shadow-md",
        secondary:
          "bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-900 hover:from-zinc-200 hover:to-zinc-300 border border-zinc-300 shadow-md hover:shadow-lg",
        brand:
          "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl border border-blue-600",
        ghost:
          "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-700",
        link:
          "text-zinc-900 underline-offset-4 hover:underline",
        glow:
          "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] border border-zinc-800",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-xl px-6",
        xl: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // When asChild is true, Slot expects only one child, so we need to wrap everything
    if (asChild) {
      return (
        <Comp
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {children}
            </div>
          ) : (
            children
          )}
        </Comp>
      )
    }

    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect for default and brand variants */}
        {(variant === "default" || variant === "brand" || variant === "glow") && (
          <div className="absolute inset-0 -top-1 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}

        {loading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }