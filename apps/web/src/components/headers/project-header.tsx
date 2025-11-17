"use client";

import { Button } from "@commis/ui/components/button";
import { useProject } from "../projects/provider";
import { AppHeader } from "./app-header";
import { Separator } from "@commis/ui/components/separator";

export function ProjectHeader() {
  const { project, setIsDashboardOpen, isDashboardOpen } = useProject();
  return (
    <AppHeader>
      <div className="flex-1 h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-2 h-full">
          <Separator orientation="vertical" className="h-full" />
          <h2 className="ml-4">{project.name}</h2>
        </div>
        <Button
          size="sm"
          disabled={!project.convexDeploymentName}
          onClick={() => setIsDashboardOpen((prev) => !prev)}
        >
          {isDashboardOpen ? "Close Dashboard" : "Open Dashboard"}
        </Button>
      </div>
    </AppHeader>
  );
}
