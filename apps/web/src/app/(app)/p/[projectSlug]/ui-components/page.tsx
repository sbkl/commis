import { QuerySearchProvider } from "@/components/search";
import { UiComponents } from "@/components/ui-components";
import { api } from "@commis/api/src/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { redirect, RedirectType } from "next/navigation";

export default async function UiComponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return redirect("/auth", RedirectType.replace);
  }

  const { q } = await searchParams;

  const preloadedUiComponentsQuery = await preloadQuery(
    api.uiComponents.query.list,
    {
      vendor: "shadcn",
      searchQuery: q,
    },
    { token }
  );
  return (
    <QuerySearchProvider>
      <UiComponents preloadedUiComponentsQuery={preloadedUiComponentsQuery} />
    </QuerySearchProvider>
  );
}
