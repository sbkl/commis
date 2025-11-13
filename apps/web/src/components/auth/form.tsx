"use client";

import { SiGithub } from "react-icons/si";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@commis/ui/components/button";

export function AuthForm() {
  const { signIn } = useAuthActions();
  return (
    <Button onClick={() => void signIn("github")}>
      <SiGithub className="size-4" />
      Sign in with GitHub
    </Button>
  );
}
