"use client";

import { TextShimmer } from "@commis/ui/components/text-shimmer";
import { Authenticated } from "convex/react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import * as React from "react";
import { useProject } from "@/components/projects/provider";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@commis/ui/components/card";
import Link from "next/link";
import { Badge } from "@commis/ui/components/badge";

function InstallationProgress() {
  const { project } = useProject();

  const steps = [
    "Creating Convex project",
    "Initializing local project",
    "Installing framework dependencies",
    "Syncing project with Convex",
    "Setting up shadcn/ui",
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

function ProjectCard({
  href,
  title,
  status,
}: {
  href: string;
  title: string;
  status?: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-64">
        <CardHeader>
          <CardTitle className="group-hover:underline">{title}</CardTitle>
        </CardHeader>
        {status && (
          <CardFooter>
            <Badge variant="outline">{status}</Badge>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

const projectCards = [
  { href: "/features", title: "Features" },
  { href: "/convex-components", title: "Convex Components" },
  { href: "/ui-components", title: "UI Components" },
];

export function ProjectContent() {
  const { project } = useProject();

  const isCompleted = project.status === "created";

  return (
    <Authenticated>
      <div className="w-full h-[var(--project-content-height)]">
        {!isCompleted ? (
          <InstallationProgress />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto py-12">
              <ProjectCard
                href={`/p/${project.slug}/authentication`}
                title="Authentication"
                status={project.authentication?.status}
              />
              {projectCards.map((card) => (
                <ProjectCard
                  key={card.href}
                  href={`/p/${project.slug}${card.href}`}
                  title={card.title}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Authenticated>
  );
}
