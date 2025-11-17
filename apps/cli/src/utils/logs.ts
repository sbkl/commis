import type { Doc } from "@commis/api/src/convex/_generated/dataModel";
import { requireAuth } from "./auth";
import { getDeviceInfo } from "./device";

export const logs = {
  devCommand: async (workingDir: string) => {
    const user = await requireAuth();
    const deviceInfo = getDeviceInfo();
    console.log(`👤 Logged in as: ${user.name || user.email || "Unknown"}`);
    console.log(`📱 Device: ${deviceInfo.deviceName}`);
    console.log(`📁 Working directory: ${workingDir}`);
  },
  initializing: (project: Doc<"projects">) => {
    console.log(
      `[${new Date().toISOString()}] 🚀 Initialising new project: ${project.name} (${project.slug})`
    );
    console.log(
      `  Framework: ${project.framework}, Package Manager: ${project.packageManager}`
    );
  },
  initializingError: (project: Doc<"projects">, error: Error) => {
    console.error(
      `[${new Date().toISOString()}] Failed to initialize project ${project.name}:`,
      error
    );
  },
};
