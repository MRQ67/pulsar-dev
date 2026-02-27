import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-none border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        success: "border-transparent bg-green-500/10 text-green-500",
        warning: "border-transparent bg-yellow-500/10 text-yellow-500",
        destructive: "border-transparent bg-red-500/10 text-red-500",
        outline: "border-input text-muted-foreground",
        open: "border-transparent bg-blue-500/10 text-blue-500",
        merged: "border-transparent bg-purple-500/10 text-purple-500",
        closed: "border-transparent bg-muted text-muted-foreground",
        queued: "border-transparent bg-gray-500/10 text-gray-500",
        in_progress: "border-transparent bg-yellow-500/10 text-yellow-500",
        completed: "border-transparent bg-green-500/10 text-green-500",
        failed: "border-transparent bg-red-500/10 text-red-500",
        cancelled: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type StatusVariant = VariantProps<typeof statusBadgeVariants>["variant"]

interface StatusBadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
}

function StatusBadge({
  className,
  variant = "default",
  label,
  ...props
}: StatusBadgeProps) {
  const displayLabel = label || variant || "default"

  return (
    <span
      data-slot="status-badge"
      data-variant={variant}
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {displayLabel}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
