"use client";

import * as React from "react";
import { Authenticated } from "convex/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useProject } from "./projects/provider";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { TextShimmer } from "@commis/ui/components/text-shimmer";

interface EditorProps {
  defaultLayout: number[];
}

function InstallationProgress() {
  const { project } = useProject();

  const steps = [
    "Initializing project",
    "Installing framework",
    "Setting up Convex",
    "Installing shadcn",
    "Configuring TypeScript",
  ] as const;

  const isInstalling =
    project.status === "create" || project.status === "creating";
  const isCompleted = project.status === "created";

  if (!isInstalling && !isCompleted) {
    return null;
  }

  const currentStepIndex = project.currentStep
    ? steps.indexOf(project.currentStep)
    : -1;

  return (
    <div className=" max-w-md mx-auto h-full space-y-8 mt-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{project.name}</h2>
        {isCompleted ? (
          <p className="text-muted-foreground">Project setup complete!</p>
        ) : (
          <p className="text-muted-foreground">Setting up your project...</p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center w-72">
        <div className="grid grid-cols-12 gap-y-8 gap-x-2">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isDone = isCompleted || index < currentStepIndex;

            return (
              <React.Fragment key={step}>
                <div className="col-span-1">
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="col-span-11 pl-2">
                  {isActive ? (
                    <TextShimmer className="text-muted-foreground" duration={1}>
                      {step}
                    </TextShimmer>
                  ) : (
                    <p
                      className={
                        isDone
                          ? "text-muted-foreground line-through"
                          : "text-muted-foreground/50"
                      }
                    >
                      {step}
                    </p>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Editor({ defaultLayout = [20, 100] }: EditorProps) {
  const { project } = useProject();
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };

  const isCompleted = project.status === "created";

  return (
    <Authenticated>
      <PanelGroup direction="horizontal" onLayout={onLayout}>
        <Panel
          defaultSize={defaultLayout[0]}
          minSize={20}
          maxSize={30}
          collapsible
        >
          <div className="w-full h-full px-6 py-12">
            {/* <NewProjectForm /> */}
          </div>
        </Panel>
        <PanelResizeHandle className="bg-border/50  w-1 hover:cursor-col-resize" />
        <Panel defaultSize={defaultLayout[1]} minSize={10} collapsible>
          <div className="w-full h-full">
            {!isCompleted ? (
              <InstallationProgress />
            ) : (
              <div className="p-6">
                <h1>{project.name}</h1>
                {/* Editor content goes here */}
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </Authenticated>
  );
}
