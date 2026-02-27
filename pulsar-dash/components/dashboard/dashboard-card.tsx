import * as React from "react"

import { cn } from "@/lib/utils"

function DashboardCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-card"
      className={cn(
        "bg-background text-foreground flex min-w-0 flex-1 flex-col items-start gap-4 border border-dashed p-4 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DashboardCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-card-header"
      className={cn("flex w-full items-center justify-between gap-4", className)}
      {...props}
    />
  )
}

function DashboardCardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-card-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function DashboardCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-card-description"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  )
}

function DashboardCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-card-content"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function DashboardCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dashboard-card-footer"
      className={cn(
        "flex w-full items-center justify-between gap-4 border-t pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardFooter,
}
