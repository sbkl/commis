"use client";

import * as React from "react";

import { api } from "@commis/api/src/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";

interface ProjectContextProps {
  project: typeof api.projects.query.protectedFindOrThrow._returnType;
}

interface ProjectProviderProps {
  children: React.ReactNode;
  preloadedProjectQuery: Preloaded<
    typeof api.projects.query.protectedFindOrThrow
  >;
}
const ProjectContext = React.createContext<ProjectContextProps | undefined>(
  undefined
);

export function ProjectProvider({
  children,
  preloadedProjectQuery,
}: ProjectProviderProps) {
  const project = usePreloadedQuery(preloadedProjectQuery);
  return <ProjectContext value={{ project }}>{children}</ProjectContext>;
}

export function useProject() {
  const context = React.use(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
