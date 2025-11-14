import { api } from "@commis/api/src/convex/_generated/api";
import { client } from "../client";
import { onQueryUpdate, requireAuth } from "../utils/auth";
import { getDeviceInfo, getWorkingDirectory } from "../utils/device";

const QUERIES = [
  {
    name: "projects.list",
    query: api.projects.cli.query.list,
    args: {} as Record<string, unknown>, // tweak per query if needed
  },
  // add more queries here:
  // {
  //   name: "tasks.open",
  //   query: api.tasks.query.open,
  //   args: { status: "open" },
  // },
] as const;

export async function dev(): Promise<void> {
  // Ensure user is authenticated
  const user = await requireAuth();
  const deviceInfo = getDeviceInfo();
  const workingDir = await getWorkingDirectory();

  console.log(`👤 Logged in as: ${user.name || user.email || "Unknown"}`);
  console.log(`📱 Device: ${deviceInfo.deviceName}`);
  if (workingDir) {
    console.log(`📁 Working directory: ${workingDir}`);
  }
  console.log();

  const unsubscribers: Array<() => void> = [];

  for (const { name, query, args } of QUERIES) {
    console.log(`Subscribing to ${name}...`);

    const unsubscribe = await onQueryUpdate(query, args, (value) => {
      // Don't console.clear() here if you want to see all streams interleaved.
      // If you prefer a dashboard-like UX you *can* clear, but it will hide previous logs.
      console.log(`[${new Date().toISOString()}] Latest document for ${name}:`);
      const newProjects = value.filter((p) => p.status === "create");
      if (newProjects.length > 0) {
        for (const project of newProjects) {
          console.log(
            `[${new Date().toISOString()}] 🚀 New project created: ${project.name} (${project.slug})`
          );
        }
      }
      console.log("─────────────────────────────────────────────");
    });

    unsubscribers.push(unsubscribe);
  }

  process.on("SIGINT", () => {
    console.log("Shutting down…");
    for (const u of unsubscribers) u();
    client.close();
    process.exit(0);
  });
}
