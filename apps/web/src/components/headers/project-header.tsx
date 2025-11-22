"use client";

import { useProject } from "../projects/provider";
import { AppHeader } from "./app-header";
import { ConvexDashboard } from "../projects/convex-dashboard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@commis/ui/components/breadcrumb";
import Link from "next/link";

export function ProjectHeader() {
  const { project } = useProject();
  return (
    <AppHeader>
      <div className="flex-1 h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-2 h-full text-sm">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/p/${project.slug}`}>{project.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <ConvexDashboard />
      </div>
    </AppHeader>
  );
}
