import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DashboardCard } from "./dashboard-card"

interface ProjectCardProps extends React.ComponentProps<"div"> {
  name: string
  description?: string
  prCount?: number
  workflowStatus?: "success" | "failed" | "pending"
  lastActivity?: string
}

function ProjectCard({
  className,
  name,
  description,
  prCount = 0,
  workflowStatus = "success",
  lastActivity,
  ...props
}: ProjectCardProps) {
  return (
    <DashboardCard
      className={cn(
        "hover:border-primary/50 cursor-pointer transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-sm font-medium truncate">{name}</h3>
          {description && (
            <p className="text-muted-foreground text-xs line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <Badge
          variant={
            workflowStatus === "success"
              ? "secondary"
              : workflowStatus === "failed"
                ? "destructive"
                : "outline"
          }
          className="shrink-0"
        >
          {workflowStatus === "success"
            ? "Passed"
            : workflowStatus === "failed"
              ? "Failed"
              : "Pending"}
        </Badge>
      </div>

      <div className="flex w-full items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{prCount} open PR{prCount !== 1 ? "s" : ""}</span>
        {lastActivity && <span>{lastActivity}</span>}
      </div>
    </DashboardCard>
  )
}

export { ProjectCard }
