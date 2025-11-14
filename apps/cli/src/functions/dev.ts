import { api } from "@commis/api/src/convex/_generated/api";
import { client } from "../client";
import { mutation, onQueryUpdate, requireAuth } from "../utils/auth";
import { getDeviceInfo, getWorkingDirectory } from "../utils/device";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs-extra";

/**
 * Add compiler options to a tsconfig.json file by manipulating it as text
 */
async function addCompilerOptions(
  filePath: string,
  options: Record<string, any>
): Promise<void> {
  let content = await fs.readFile(filePath, "utf-8");

  // Find the compilerOptions section
  const compilerOptionsMatch = content.match(/"compilerOptions"\s*:\s*\{/);

  if (!compilerOptionsMatch) {
    // If no compilerOptions exist, we need to add it
    // Find the first { and add compilerOptions after it
    content = content.replace(/(\{)/, '$1\n  "compilerOptions": {},');
  }

  // Now find the closing brace of compilerOptions
  // We need to find the matching closing brace
  const startIndex = content.indexOf('"compilerOptions"');
  if (startIndex === -1) return;

  const openBraceIndex = content.indexOf("{", startIndex);
  let depth = 0;
  let closeBraceIndex = -1;

  for (let i = openBraceIndex; i < content.length; i++) {
    if (content[i] === "{") depth++;
    if (content[i] === "}") {
      depth--;
      if (depth === 0) {
        closeBraceIndex = i;
        break;
      }
    }
  }

  if (closeBraceIndex === -1) return;

  // Check what's before the closing brace (skip whitespace)
  let insertIndex = closeBraceIndex;
  let beforeCloseBrace = content.substring(0, closeBraceIndex).trimEnd();
  const needsComma =
    !beforeCloseBrace.endsWith("{") && !beforeCloseBrace.endsWith(",");

  // Build the options string
  const optionsEntries = Object.entries(options);
  let optionsText = "";

  for (let i = 0; i < optionsEntries.length; i++) {
    const entry = optionsEntries[i];
    if (!entry) continue;

    const [key, value] = entry;
    const isLast = i === optionsEntries.length - 1;

    if (i === 0 && needsComma) {
      optionsText += ",";
    }

    optionsText += `\n    "${key}": ${JSON.stringify(value)}`;
    if (!isLast) {
      optionsText += ",";
    }
  }

  // Insert the options before the closing brace
  content =
    content.substring(0, insertIndex) +
    optionsText +
    "\n  " +
    content.substring(insertIndex);

  await fs.writeFile(filePath, content, "utf-8");
}

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

interface Project {
  name: string;
  slug: string;
  framework: "expo" | "nextjs" | "tanstack-start" | "react-vite" | "remix";
  packageManager: "bun" | "npm" | "pnpm" | "yarn";
  status: "create" | "update" | "delete";
}

/**
 * Execute a command in a specific directory
 */
function executeCommand(cmd: string, cwd: string): void {
  console.log(`  Running in ${cwd}: ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

/**
 * Get the package manager executable command
 */
function getPackageManagerExec(
  packageManager: Project["packageManager"]
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
function installDeps(
  packageManager: Project["packageManager"],
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

/**
 * Get the initialization command for a framework
 */
function getInitCommand(
  framework: Project["framework"],
  packageManager: Project["packageManager"],
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
 * Initialize a new project in the working directory
 */
async function initializeProject(
  project: Project,
  workingDir: string
): Promise<void> {
  try {
    // Ensure the working directory exists
    if (!(await fs.pathExists(workingDir))) {
      console.log(`  📁 Creating working directory: ${workingDir}`);
      await fs.ensureDir(workingDir);
    }

    const projectPath = path.join(workingDir, project.slug);

    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Installing framework",
    });

    // Check if project directory already exists
    if (await fs.pathExists(projectPath)) {
      console.log(`  ⚠️  Directory already exists: ${projectPath}`);
      console.log(`  Skipping initialization...`);
      return;
    }

    console.log(`  📂 Creating project in: ${projectPath}`);

    // Get package manager executor for later use
    const pmx = getPackageManagerExec(project.packageManager);

    // Update status to initializing
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Initializing project",
    });

    // Update status to installing framework
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Installing framework",
    });

    // Get the initialization command and execute it
    const initCmd = getInitCommand(
      project.framework,
      project.packageManager,
      project.slug
    );
    executeCommand(initCmd, workingDir);

    // Setup Convex
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Setting up Convex",
    });

    console.log(`  🔧 Setting up Convex...`);

    // Create convex.json configuration file
    const convexConfig = {
      $schema:
        "https://raw.githubusercontent.com/get-convex/convex-backend/refs/heads/main/npm-packages/convex/schemas/convex.schema.json",
      functions: "src/convex/",
    };
    const convexConfigPath = path.join(projectPath, "convex.json");
    await fs.writeJson(convexConfigPath, convexConfig, { spaces: 2 });
    console.log(`  ✅ Created convex.json`);

    // Install Convex package
    installDeps(project.packageManager, ["convex"], projectPath);

    // Initialize Convex with automatic new project creation
    // --once: Run setup once and exit
    // --configure=new: Automatically create a new Convex project
    console.log(`  ℹ️  Creating a new Convex project for ${project.name}...`);
    executeCommand(
      `${pmx} convex dev --once --configure new --project ${project.slug} --tail-logs disable`,
      projectPath
    );
    // Install shadcn
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Installing shadcn",
    });

    console.log(`  🎨 Installing shadcn/ui...`);

    // Initialize shadcn/ui interactively
    const shadcnCmd =
      project.packageManager === "bun"
        ? `${pmx} --bun shadcn@latest init`
        : `${pmx} shadcn@latest init`;

    executeCommand(`${shadcnCmd} --base-color neutral`, projectPath);

    // Update TypeScript configurations
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Configuring TypeScript",
    });

    console.log(`  ⚙️  Updating TypeScript configurations...`);

    // Update root tsconfig.json
    const rootTsConfigPath = path.join(projectPath, "tsconfig.json");
    if (await fs.pathExists(rootTsConfigPath)) {
      await addCompilerOptions(rootTsConfigPath, {
        noUncheckedIndexedAccess: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
      });
      console.log(`  ✅ Updated root tsconfig.json`);
    }

    // Update src/convex/tsconfig.json
    const convexTsConfigPath = path.join(
      projectPath,
      "src",
      "convex",
      "tsconfig.json"
    );
    if (await fs.pathExists(convexTsConfigPath)) {
      await addCompilerOptions(convexTsConfigPath, {
        noUncheckedIndexedAccess: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        paths: {
          "@/*": ["../../src/*"],
        },
      });
      console.log(`  ✅ Updated src/convex/tsconfig.json`);
    }

    // Mark as created
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "created",
    });

    console.log(`  ✅ Project initialized successfully!`);
  } catch (error) {
    console.error(`  ❌ Failed to initialize project:`, error);
    throw error;
  }
}

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

  const unsubscribers: Array<() => void> = [];

  for (const { query, args } of QUERIES) {
    console.log(`🌐 Synced and ready to work!`);

    const unsubscribe = await onQueryUpdate(query, args, async (value) => {
      const newProjects = value.filter((p) => p.status === "create");
      if (newProjects.length > 0) {
        if (!workingDir) {
          console.error(
            `[${new Date().toISOString()}] ❌ No working directory configured. Please run 'commis init' first.`
          );
        } else {
          for (const project of newProjects) {
            console.log(
              `[${new Date().toISOString()}] 🚀 Initialising new project: ${project.name} (${project.slug})`
            );
            console.log(
              `  Framework: ${project.framework}, Package Manager: ${project.packageManager}`
            );

            try {
              await initializeProject(project as Project, workingDir);
            } catch (error) {
              console.error(
                `[${new Date().toISOString()}] Failed to initialize project ${project.name}:`,
                error
              );
            }
          }
        }
      }
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
