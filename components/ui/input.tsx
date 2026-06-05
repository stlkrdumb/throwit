import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[var(--neo-radius-sm)] border-2 border-black bg-transparent px-3 py-1.5 text-xs font-mono uppercase tracking-wide placeholder:text-slate-400 transition-colors outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--neo-blue)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--neo-red)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
