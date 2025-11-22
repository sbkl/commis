// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "@/hooks/use-query";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import Link from "next/link";

export default function Home() {
  const { signOut } = useAuthActions();
  const { data: user } = useQuery(api.users.query.me, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <AuthLoading>
        <div>Auth is loading...</div>
      </AuthLoading>
      <Authenticated>
        <div className="flex flex-col gap-2">
          logged in as {user?.email}
          <Button
            onClick={async () => {
              await signOut();
              window.location.href = "/auth";
            }}
          >
            Sign out
          </Button>
        </div>
      </Authenticated>
      <Unauthenticated>
        <Button>
          <Link href="/auth">Go to Sign in</Link>
        </Button>
      </Unauthenticated>
    </div>
  );
}
