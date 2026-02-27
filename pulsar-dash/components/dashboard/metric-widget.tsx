import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { DashboardCard } from "./dashboard-card"

interface MetricWidgetProps extends React.ComponentProps<"div"> {
  label: string
  value: string | number
  icon?: Icon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

function MetricWidget({
  className,
  label,
  value,
  icon: Icon,
  trend,
  description,
  ...props
}: MetricWidgetProps) {
  return (
    <DashboardCard
      className={cn("justify-center", className)}
      {...props}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">{label}</span>
          <span className="text-2xl font-semibold">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-xs",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-muted-foreground text-xs">
              {description}
            </span>
          )}
        </div>
        {Icon && (
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-none">
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </DashboardCard>
  )
}

export { MetricWidget }
