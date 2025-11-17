"use client";

import * as React from "react";

import { api } from "@commis/api/src/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";

interface ProjectContextProps {
  isDashboardOpen: boolean;
  setIsDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  project: (typeof api.projects.query.protectedFindOrThrow._returnType)["project"];
  uiComponents: (typeof api.projects.query.protectedFindOrThrow._returnType)["uiComponents"];
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
  const projectQuery = usePreloadedQuery(preloadedProjectQuery);
  const [isDashboardOpen, setIsDashboardOpen] = React.useState(false);
  return (
    <ProjectContext
      value={{
        isDashboardOpen,
        setIsDashboardOpen,
        project: projectQuery.project,
        uiComponents: projectQuery.uiComponents,
      }}
    >
      {children}
    </ProjectContext>
  );
}

export function useProject() {
  const context = React.use(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
