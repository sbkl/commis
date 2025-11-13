"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@commis/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@commis/ui/components/avatar";
import { useAuthActions } from "@convex-dev/auth/react";
import { ThemeToggle } from "@commis/ui/components/theme-toggle";
import { LogOut } from "lucide-react";
import { useMe } from "@/components/auth/user-provider";
import { Button } from "@commis/ui/components/button";

interface UserNavProps {
  signOutRedirectPathname?: string;
}

export function UserNav({ signOutRedirectPathname = "/" }: UserNavProps) {
  const { user } = useMe();
  const { signOut } = useAuthActions();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="h-8 w-8 rounded-lg">
            {user.image ? (
              <AvatarImage
                src={user.image}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : null}

            <AvatarFallback className="rounded-lg">
              {user.firstName
                ? `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`
                : ""}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {user.image ? (
                <AvatarImage
                  src={user.image}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : null}
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeToggle />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            // Navigate immediately to prevent WebSocket connection errors
            // Use href instead of reload to navigate away before components can render
            window.location.href = signOutRedirectPathname;
          }}
        >
          <LogOut name="ExitIcon" className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
