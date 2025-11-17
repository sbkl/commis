import { ManagedAuth } from "@/components/auth/managed-auth";
import { UserProvider } from "@/components/auth/user-provider";
import { SidebarProvider } from "@commis/ui/components/sidebar";
import { api } from "@commis/api/src/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  const preloadedUserQuery = await preloadQuery(
    api.users.query.me,
    {},
    { token }
  );

  return (
    <UserProvider preloadedUserQuery={preloadedUserQuery}>
      <ManagedAuth>
        <SidebarProvider className="h-full w-full">
          <div className="w-full h-full pt-12">{children}</div>
        </SidebarProvider>
      </ManagedAuth>
    </UserProvider>
  );
}
