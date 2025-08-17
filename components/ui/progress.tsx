"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple progress component without Radix dependency
const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
  }
>(({ className, value, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-700",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 neon-glow"
      style={{ width: `${Math.min(100, ((value || 0) / max) * 100)}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
