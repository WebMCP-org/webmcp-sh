import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-divide bg-gray-50 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:border-brand focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-charcoal-700 dark:text-white dark:placeholder:text-gray-500 dark:focus-visible:ring-brand/40 md:text-sm aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
