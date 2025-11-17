import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs-extra";
import type { Doc } from "@commis/api/src/convex/_generated/dataModel";
/**
 * Execute a command in a specific directory
 */
export function executeCommand(cmd: string, cwd: string): void {
  execSync(cmd, { cwd, stdio: "inherit" });
}

/**
 * Read and parse the .env.local file to extract environment variables
 */
export async function readEnvLocal(
  projectPath: string
): Promise<Record<string, string>> {
  const envPath = path.join(projectPath, ".env.local");

  if (!(await fs.pathExists(envPath))) {
    throw new Error(`.env.local file not found at ${envPath}`);
  }

  const content = await fs.readFile(envPath, "utf-8");
  const env: Record<string, string> = {};

  // Parse the .env file line by line
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // Parse key=value pairs
    const equalIndex = trimmedLine.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  }

  return env;
}

/**
 * Get the package manager executable command
 */
export function getPackageManagerExec(
  packageManager: Doc<"projects">["packageManager"]
): string {
  const pmxMap = {
    npm: "npx",
    yarn: "yarn",
    pnpm: "pnpm dlx",
    bun: "bunx",
  };
  return pmxMap[packageManager];
}

/**
 * Install dependencies using the specified package manager
 */
export function installDeps(
  packageManager: Doc<"projects">["packageManager"],
  packages: string[],
  cwd: string,
  dev = false
): void {
  if (!packages.length) return;

  let cmd = "";
  switch (packageManager) {
    case "pnpm":
      cmd = `pnpm add${dev ? " -D" : ""} ${packages.join(" ")}`;
      break;
    case "yarn":
      cmd = `yarn add${dev ? " -D" : ""} ${packages.join(" ")}`;
      break;
    case "bun":
      cmd = `bun add${dev ? " -d" : ""} ${packages.join(" ")}`;
      break;
    case "npm":
    default:
      cmd = `npm install${dev ? " -D" : ""} ${packages.join(" ")}`;
      break;
  }

  executeCommand(cmd, cwd);
}

export const uiComponentsVendorCommands = {
  shadcn: {
    bun: "bunx --bun shadcn@latest add",
    pnpm: "pnpm dlx shadcn@latest add",
    npm: "npx shadcn@latest add",
    yarn: "yarn shadcn@latest add",
  },
};

/**
 * Get the initialization command for a framework
 */
export function getInitCommand(
  framework: Doc<"projects">["framework"],
  packageManager: Doc<"projects">["packageManager"],
  projectName: string
): string {
  const pmx = getPackageManagerExec(packageManager);

  switch (framework) {
    case "nextjs":
      return `${pmx} create-next-app@latest ${projectName} --yes --src-dir`;
    case "expo":
      return `${pmx} create-expo-app@latest ${projectName} --yes`;
    case "tanstack-start":
      return `${pmx} create-tanstack-start@latest ${projectName}`;
    case "react-vite":
      return `${pmx} create-vite@latest ${projectName} -- --template react-ts`;
    case "remix":
      return `${pmx} create-remix@latest ${projectName} --yes`;
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}
