"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@commis/ui/components/button";
import { Input } from "@commis/ui/components/input";
import { Label } from "@commis/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@commis/ui/components/card";
import { useMutation } from "@/hooks/use-mutation";
import { api } from "@commis/api/src/convex/_generated/api";
import { toast } from "sonner";

export default function DeviceAuthPage() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [code, setCode] = useState(codeParam || "");
  const [submitted, setSubmitted] = useState(false);

  const verifyMutation = useMutation(api.cliAuth.mutation.verifyDeviceCode, {
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Device verified successfully!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify code"
      );
    },
  });

  useEffect(() => {
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [codeParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verifyMutation.mutate({ code: code.trim().toUpperCase() });
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>✓ Device Verified</CardTitle>
            <CardDescription>
              You can now close this window and return to your terminal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify CLI Device</CardTitle>
          <CardDescription>
            Enter the code shown in your terminal to authorize this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-lg uppercase"
                maxLength={8}
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full">
              Verify Device
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
