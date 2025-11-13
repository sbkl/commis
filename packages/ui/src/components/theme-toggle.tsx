"use client";

import { useTheme } from "next-themes";

import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuItem,
} from "@commis/ui/components/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        {theme === "dark" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
          <DropdownMenuItem
            className="text-sm text-foreground flex items-center gap-2 h-8 px-2 py-1.5 focus-visible:outline-none focus:bg-accent focus:text-accent-foreground"
            onClick={() => setTheme("light")}
          >
            <Sun className="size-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-sm text-foreground flex items-center gap-2 h-8 px-2 py-1.5 focus-visible:outline-none focus:bg-accent focus:text-accent-foreground"
            onClick={() => setTheme("dark")}
          >
            <Moon className="size-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-sm text-foreground flex items-center gap-2 h-8 px-2 py-1.5 focus-visible:outline-none focus:bg-accent focus:text-accent-foreground"
            onClick={() => setTheme("system")}
          >
            <Monitor className="size-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
