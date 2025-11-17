import { ProjectHeader } from "@/components/headers/project-header";
import { ProjectProvider } from "@/components/projects/provider";
import { api } from "@commis/api/src/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/auth");
  }
  const preloadedProjectQuery = await preloadQuery(
    api.projects.query.protectedFindOrThrow,
    { slug: projectSlug },
    { token }
  );

  return (
    <ProjectProvider preloadedProjectQuery={preloadedProjectQuery}>
      <ProjectHeader />
      {children}
    </ProjectProvider>
  );
}
