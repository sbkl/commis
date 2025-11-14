"use client";

import { SiGithub } from "react-icons/si";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@commis/ui/components/button";

export function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const { signIn } = useAuthActions();

  async function handleSignIn() {
    const formData = new FormData();
    if (redirectTo) {
      formData.append("redirectTo", redirectTo);
    }
    await signIn("github", formData);
  }

  return (
    <Button onClick={() => void handleSignIn()}>
      <SiGithub className="size-4" />
      Sign in with GitHub
    </Button>
  );
}
