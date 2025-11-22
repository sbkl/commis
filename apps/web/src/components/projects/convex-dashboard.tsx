"use client";

import * as React from "react";

import { useProject } from "./provider";
import { Button } from "@commis/ui/components/button";
import { X } from "lucide-react";
import { cn } from "@commis/ui/lib/utils";
import { useEventListener } from "@commis/ui/hooks/use-event-listener";
export function ConvexDashboard() {
  const { project } = useProject();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // We first wait for the iframe to send a dashboard-credentials-request message.
      // This makes sure that we don't send the credentials until the iframe is ready.
      if (event.data?.type !== "dashboard-credentials-request") {
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "dashboard-credentials",
          adminKey: project.adminKey,
          deploymentUrl: project.convexDeploymentUrl,
          deploymentName: project.convexDeploymentName,
          // Optional: specify which pages to show
          // visiblePages: ["data"],
        },
        "*"
      );
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    project.convexDeploymentUrl,
    project.adminKey,
    project.convexDeploymentName,
  ]);

  // Close on Escape key
  useEventListener(
    "keydown",
    (e) => {
      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    undefined,
    {
      capture: true,
    }
  );

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Convex Dashboard
      </Button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
          {
            "opacity-0 pointer-events-none": !open,
            "opacity-100": open,
          }
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal={open}
        aria-labelledby="convex-dashboard-title"
        className={cn(
          "fixed top-6 bottom-6 left-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-lg transition-all duration-200",
          {
            "opacity-0 pointer-events-none translate-y-2": !open,
            "opacity-100 translate-y-0": open,
          }
        )}
      >
        <div className="h-12 bg-background border-b flex items-center justify-between pl-4 pr-1.5 shrink-0">
          <h2 id="convex-dashboard-title" className="text-sm font-medium">
            Convex Dashboard
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(false)}
            aria-label="Close dashboard"
          >
            <X />
          </Button>
        </div>
        <iframe
          ref={iframeRef}
          src="https://dashboard-embedded.convex.dev/data"
          allow="clipboard-write"
          className="flex-1"
          title="Convex Dashboard"
        />
      </div>
    </>
  );
}
