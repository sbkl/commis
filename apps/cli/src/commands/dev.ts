import { api } from "@commis/api/src/convex/_generated/api";
import { client } from "../client";
import { mutation, onQueryUpdate } from "../utils/auth";
import { getWorkingDirectory } from "../utils/device";

import * as path from "path";
import * as fs from "fs-extra";
import type { Doc } from "@commis/api/src/convex/_generated/dataModel";
import { logs } from "../utils/logs";
import { addCompilerOptions } from "../utils/typescript";
import {
  executeCommand,
  getInitCommand,
  getPackageManagerExec,
  installDeps,
  uiComponentsVendorCommands,
} from "../utils/helpers";

/**
 * Initialize a new project in the working directory
 */
async function initializeProject(
  project: Doc<"projects">,
  workingDir: string
): Promise<void> {
  try {
    const projectPath = path.join(workingDir, project.slug);

    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Initializing local project",
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
    // Update status to installing framework
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Installing framework dependencies",
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
      currentStep: "Syncing project with Convex",
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
    console.log(`  ℹ️  Initializing Convex project for ${project.name}...`);
    executeCommand(
      `${pmx} convex dev --once --configure existing --team ${project.convexTeamSlug} --project ${project.convexSlug} --dev-deployment cloud --tail-logs disable`,
      projectPath
    );

    // Install shadcn
    await mutation(api.projects.cli.mutation.patchStatus, {
      slug: project.slug,
      status: "creating",
      currentStep: "Setting up shadcn/ui",
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
  const workingDir = await getWorkingDirectory();

  await logs.devCommand(workingDir);

  // Track UI components currently being installed to prevent duplicates
  const installingProjects = new Set<string>();
  const installingComponents = new Set<string>();

  const unsubscribers: Array<() => void> = [];

  const projectListUnsubscribe = await onQueryUpdate(
    api.projects.cli.query.list,
    { status: "create" },
    async (newProjects) => {
      for (const project of newProjects) {
        if (installingProjects.has(project._id)) {
          continue;
        }
        installingProjects.add(project._id);
        logs.initializing(project);
        try {
          await initializeProject(project, workingDir);
        } catch (error) {
          logs.initializingError(project, error as Error);
        } finally {
          installingProjects.delete(project._id);
        }
      }
    }
  );

  const pendingUiComponentsUnsubscribe = await onQueryUpdate(
    api.uiComponents.cli.query.pendingUiComponents,
    {},
    async (value) => {
      console.log("Pending UI components: ", value.length);
      for (const uiComponent of value) {
        if (installingComponents.has(uiComponent._id)) {
          continue;
        }
        installingComponents.add(uiComponent._id);

        console.log(
          `🎨 Installing ${uiComponent.uiComponent.name} from ${uiComponent.uiComponent.vendor}...`
        );
        try {
          await mutation(api.uiComponents.cli.mutation.patchStatus, {
            id: uiComponent._id,
            status: "installing",
          });
          await installUiComponent(uiComponent, workingDir);

          await mutation(api.uiComponents.cli.mutation.patchStatus, {
            id: uiComponent._id,
            status: "installed",
          });
        } catch (error) {
          console.error(
            `[${new Date().toISOString()}] Failed to install UI component ${uiComponent.uiComponent.name}:`,
            error
          );
        } finally {
          // Remove from tracking set when done (success or failure)
          installingComponents.delete(uiComponent._id);
        }
      }
    }
  );

  unsubscribers.push(projectListUnsubscribe);
  unsubscribers.push(pendingUiComponentsUnsubscribe);

  console.log(`🌐 Synced and ready to work!`);
  process.on("SIGINT", () => {
    console.log("Shutting down…");
    for (const u of unsubscribers) u();
    client.close();
    process.exit(0);
  });
}

async function installUiComponent(
  projectUiComponent: Doc<"uiComponentsOnProjects"> & {
    project: Doc<"projects">;
    uiComponent: Doc<"uiComponents">;
  },
  workingDir: string
): Promise<void> {
  try {
    // Build the target project directory path
    const projectPath = path.join(workingDir, projectUiComponent.project.slug);

    // Check if project directory exists
    if (!(await fs.pathExists(projectPath))) {
      console.error(`  ⚠️  Project directory not found: ${projectPath}`);
      await mutation(api.uiComponents.cli.mutation.patchStatus, {
        id: projectUiComponent._id,
        status: "failed",
      });
      return;
    }

    // Get the command for the vendor and package manager
    const baseCommand =
      uiComponentsVendorCommands[projectUiComponent.uiComponent.vendor][
        projectUiComponent.project.packageManager
      ];

    // Build the full command with the component name
    const fullCommand = `${baseCommand} ${projectUiComponent.uiComponent.name}`;

    console.log(
      `  📦 Installing ${projectUiComponent.uiComponent.name} in ${projectUiComponent.project.slug}...`
    );

    // Execute the installation command
    executeCommand(fullCommand, projectPath);

    console.log(
      `  ✅ Successfully installed ${projectUiComponent.uiComponent.name}`
    );
  } catch (error) {
    console.error(
      `  ❌ Failed to install ${projectUiComponent.uiComponent.name}:`,
      error
    );
    throw error;
  }
}
