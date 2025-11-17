"use client";

import * as React from "react";

import { api } from "@commis/api/src/convex/_generated/api";
import { useMe } from "./auth/user-provider";
import { ProjectList } from "./projects/list";
import { QuerySearchProvider } from "./search";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Button } from "@commis/ui/components/button";

interface ProjectListProps {
  preloadedProjectListQuery: Preloaded<typeof api.projects.query.list>;
}

export function HomePage({ preloadedProjectListQuery }: ProjectListProps) {
  const initialData = usePreloadedQuery(preloadedProjectListQuery);
  const { user } = useMe();
  if (!user) return null;
  if (!user.config) {
    return (
      <div className="w-full flex flex-col gap-8 items-center justify-center max-w-md mx-auto py-12">
        <h2 className="text-2xl font-bold">Setup your Convex team</h2>
        <Button
          onClick={() => {
            window.location.href = "/api/oauth/convex/authorize";
          }}
        >
          Setup your Convex team
        </Button>
      </div>
    );
  }
  return (
    <QuerySearchProvider>
      <ProjectList initialData={initialData.page} />
    </QuerySearchProvider>
  );
}
