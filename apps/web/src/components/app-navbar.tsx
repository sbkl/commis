"use client";

import Link from "next/link";
import { Button } from "@commis/ui/components/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { UserNav } from "@/components/auth/user-nav";
import { NewProjectSheet } from "@/components/projects/new-project-form";

export function AppNavbar() {
  return (
    <div className="fixed bg-background z-10 top-0 left-0 right-0 h-12 flex items-center px-6 shadow-sm dark:shadow-xs dark:shadow-primary/10">
      <Link href="/" className="text-xl font-bold">
        Commis
      </Link>
      <Unauthenticated>
        <Button asChild className="ml-auto">
          <Link href="/auth">Sign In</Link>
        </Button>
      </Unauthenticated>
      <Authenticated>
        <div className="ml-auto flex items-center gap-2">
          <NewProjectSheet />
          <UserNav />
        </div>
      </Authenticated>
    </div>
  );
}
