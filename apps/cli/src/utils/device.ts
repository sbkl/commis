import { createHash } from "crypto";
import os from "os";
import { query, mutation, getCurrentUser } from "./auth";
import { api } from "@commis/api/src/convex/_generated/api";
import * as fs from "fs-extra";

/**
 * Get device information for device identification
 */
export function getDeviceInfo() {
  const hostname = os.hostname();
  const platform = os.platform();
  const username = os.userInfo().username;

  // Create a stable device ID based on hostname, platform, and username
  const deviceId = createHash("sha256")
    .update(`${hostname}-${platform}-${username}`)
    .digest("hex")
    .substring(0, 16);

  // Create a friendly device name
  const deviceName = `${hostname} (${getPlatformName(platform)})`;

  return {
    deviceId,
    deviceName,
    hostname,
    platform,
  };
}

/**
 * Convert platform code to friendly name
 */
function getPlatformName(platform: string): string {
  const platformMap: Record<string, string> = {
    darwin: "macOS",
    win32: "Windows",
    linux: "Linux",
    freebsd: "FreeBSD",
    openbsd: "OpenBSD",
    sunos: "Solaris",
    aix: "AIX",
  };

  return platformMap[platform] || platform;
}

/**
 * Get the working directory for the current device
 */
export async function getWorkingDirectory(): Promise<string> {
  const { deviceId } = getDeviceInfo();

  try {
    let workingDir = await query(api.users.cli.query.getWorkingDirectory, {
      deviceId,
    });
    if (workingDir) {
      // Ensure the working directory exists
      if (!(await fs.pathExists(workingDir))) {
        console.log(`  📁 Creating working directory: ${workingDir}`);
        await fs.ensureDir(workingDir);
      }
      return workingDir;
    }
    workingDir = "commis";
    if (!(await fs.pathExists(workingDir))) {
      console.log(`  📁 Creating working directory: ${workingDir}`);
      await fs.ensureDir(workingDir);
    }
    return workingDir;
  } catch (error) {
    const workingDir = "commis";
    if (!(await fs.pathExists(workingDir))) {
      console.log(`  📁 Creating working directory: ${workingDir}`);
      await fs.ensureDir(workingDir);
    }
    return workingDir;
  }
}

/**
 * Set the working directory for the current device
 */
export async function setWorkingDirectory(directory: string): Promise<boolean> {
  const { deviceId } = getDeviceInfo();

  try {
    await mutation(api.users.cli.mutation.setWorkingDirectory, {
      deviceId,
      directory,
    });
    return true;
  } catch (error) {
    console.error("Failed to set working directory:", error);
    return false;
  }
}

/**
 * Get the current device ID
 */
export function getDeviceId(): string {
  return getDeviceInfo().deviceId;
}

/**
 * Get all devices for the current user
 */
export async function getDevices() {
  try {
    return await query(api.users.cli.query.getDevices, {});
  } catch (error) {
    console.error("Failed to get devices:", error);
    return [];
  }
}

/**
 * Get the current device from the authenticated user
 */
export async function getCurrentDevice() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    deviceId: user.deviceId,
    deviceName: user.deviceName,
    hostname: user.deviceHostname,
    platform: user.devicePlatform,
  };
}
