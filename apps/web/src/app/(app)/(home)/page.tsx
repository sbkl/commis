import { HomePage } from "@/components/home-page";
import { api } from "@commis/api/src/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/auth");
  }
  const preloadedProjectListQuery = await preloadQuery(
    api.projects.query.list,
    {
      paginationOpts: {
        cursor: null,
        numItems: 24,
      },
    },
    { token }
  );
  return <HomePage preloadedProjectListQuery={preloadedProjectListQuery} />;
}
