"use client"

import * as React from "react"
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconUser,
  IconLogout,
  IconMoon,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface HeaderProps extends React.ComponentProps<"header"> {
  user?: {
    username: string
    email: string
    avatar_url: string | null
  }
  onLogout?: () => void
}

function Header({ className, user, onLogout, ...props }: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn(
        "bg-background border-b border-dashed flex h-14 items-center gap-4 px-4 md:px-6",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <IconSearch className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8 w-full md:w-64 lg:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="size-5" />
          <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-none text-[10px] font-medium">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <div className="bg-primary flex size-8 items-center justify-center rounded-full text-xs font-medium text-primary-foreground">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.username || "User"}</span>
                <span className="text-muted-foreground text-xs font-normal">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconUser className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconSettings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconMoon className="mr-2 size-4" />
              Appearance
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={onLogout}
            >
              <IconLogout className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export { Header }
