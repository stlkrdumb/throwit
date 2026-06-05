"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { value?: number }) {
  const pct = value ?? 0;
  return (
    <ProgressPrimitive.Root
      data-slot="progress-root"
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-[var(--neo-radius-sm)] border-2 border-black bg-muted",
        className
      )}
      {...props}
      value={pct}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all duration-200"
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
