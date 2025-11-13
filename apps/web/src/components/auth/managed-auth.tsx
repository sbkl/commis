"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import * as React from "react";
import { TextShimmer } from "@commis/ui/components/text-shimmer";
import Link from "next/link";

interface ManagedAuthProps {
  children: React.ReactNode;
}
export function ManagedAuth({ children }: ManagedAuthProps) {
  return (
    <>
      <AuthLoading>
        <div className="w-full flex flex-col gap-8 max-w-md mx-auto h-2/3 items-center justify-center">
          {/* <Image src="/icon.png" alt="Logo" width={64} height={64} /> */}
          <div className="text-2xl font-bold">Commis</div>
          <TextShimmer className="font-mono text-sm" duration={1}>
            Getting ready...
          </TextShimmer>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="w-full flex flex-col gap-8 max-w-md mx-auto h-2/3 items-center justify-center">
          <Link href="/auth">Go to Sign In</Link>
        </div>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}
