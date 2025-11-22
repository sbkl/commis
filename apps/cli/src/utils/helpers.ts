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

/**
 * Get the CLI package root directory
 */
function getCliRootDir(): string {
  // In the bundled output (dist/index.cjs), __dirname points to the dist folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - __dirname is available in the bundled CommonJS output
  const currentDir = __dirname;

  // If we're in dist folder, go up one level to package root
  if (currentDir.includes("/dist")) {
    return path.resolve(currentDir, "..");
  }

  // If we're in src/utils during development, go up two levels
  return path.resolve(currentDir, "../..");
}

/**
 * Copy a single template file from CLI package to project directory
 *
 * @param sourceFile - Path to template file relative to CLI package root (e.g., "src/templates/auth/convex/auth.ts")
 * @param destinationFile - Path relative to project working directory (e.g., "src/convex/auth.ts")
 * @param workingDir - The project's working directory
 */
export async function copyTemplateFile(
  sourceFile: string,
  destinationFile: string,
  workingDir: string
): Promise<void> {
  const cliRoot = getCliRootDir();
  const sourcePath = path.join(cliRoot, sourceFile);
  const destinationPath = path.join(workingDir, destinationFile);

  // Verify source file exists
  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(`Template file not found: ${sourcePath}`);
  }

  // Ensure destination directory exists
  await fs.ensureDir(path.dirname(destinationPath));

  // Read the file content
  let content = await fs.readFile(sourcePath, "utf-8");

  // Remove // @ts-nocheck annotation (with optional whitespace)
  content = content.replace(/^\/\/\s*@ts-nocheck\s*\n?/m, "");

  // Write the modified content to destination (overwrites if exists)
  await fs.writeFile(destinationPath, content, "utf-8");

  console.log(`  ✅ Copied ${path.basename(sourceFile)} to ${destinationFile}`);
}

/**
 * Copy template files from CLI package to project directory
 *
 * @param source - Path to template files relative to CLI package root (e.g., "src/templates/auth/convex")
 * @param destination - Path relative to project working directory (e.g., "src/convex")
 * @param workingDir - The project's working directory
 */
export async function copyTemplateFiles(
  source: string,
  destination: string,
  workingDir: string
): Promise<void> {
  const cliRoot = getCliRootDir();
  const sourcePath = path.join(cliRoot, source);
  const destinationPath = path.join(workingDir, destination);

  // Verify source exists
  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(`Template source not found: ${sourcePath}`);
  }

  // Ensure destination directory exists
  await fs.ensureDir(destinationPath);

  // Copy all files from source to destination
  await fs.copy(sourcePath, destinationPath, {
    overwrite: true,
  });

  console.log(`  ✅ Copied templates from ${source} to ${destination}`);
}

interface RunConvexDevProps {
  convexTeamSlug: string;
  convexProjectSlug: string;
  projectPath: string;
}
export function runConvexDev(
  pmx: string,
  { convexTeamSlug, convexProjectSlug, projectPath }: RunConvexDevProps
): void {
  executeCommand(
    `${pmx} convex dev --once --configure existing --team ${convexTeamSlug} --project ${convexProjectSlug} --dev-deployment cloud --tail-logs disable`,
    projectPath
  );
}
