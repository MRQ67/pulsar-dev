import * as React from "react"

import { cn } from "@/lib/utils"
import { StatusBadge, type StatusVariant } from "./status-badge"

interface ActivityItemProps extends React.ComponentProps<"div"> {
  type: "pr" | "workflow" | "integration"
  action: string
  title: string
  description?: string
  status?: StatusVariant
  timestamp?: string
  avatarUrl?: string | null
}

function ActivityItem({
  className,
  type,
  action,
  title,
  description,
  status,
  timestamp,
  avatarUrl,
  ...props
}: ActivityItemProps) {
  return (
    <div
      data-slot="activity-item"
      className={cn(
        "flex w-full items-start gap-3 py-3",
        className
      )}
      {...props}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
          {type === "pr"
            ? "PR"
            : type === "workflow"
              ? "WF"
              : "INT"}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{action}</span>
          {status && <StatusBadge variant={status} label={status} />}
        </div>
        <p className="text-sm font-medium truncate">{title}</p>
        {description && (
          <p className="text-muted-foreground text-xs truncate">
            {description}
          </p>
        )}
      </div>

      {timestamp && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {timestamp}
        </span>
      )}
    </div>
  )
}

export { ActivityItem }
