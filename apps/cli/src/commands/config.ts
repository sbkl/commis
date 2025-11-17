import {
  getDeviceInfo,
  getWorkingDirectory,
  setWorkingDirectory,
  getDevices,
} from "../utils/device";
import { requireAuth } from "../utils/auth";

/**
 * Show current device configuration
 */
export async function showConfig() {
  await requireAuth();

  const deviceInfo = getDeviceInfo();
  const workingDir = await getWorkingDirectory();

  console.log("\n📱 Current Device");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Device ID:         ${deviceInfo.deviceId}`);
  console.log(`  Device Name:       ${deviceInfo.deviceName}`);
  console.log(`  Hostname:          ${deviceInfo.hostname}`);
  console.log(`  Platform:          ${deviceInfo.platform}`);
  console.log(`  Working Directory: ${workingDir ?? "(not set)"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

/**
 * Set the working directory for the current device
 */
export async function setConfig(key: string, value: string) {
  await requireAuth();

  if (key === "workdir" || key === "working-directory") {
    const success = await setWorkingDirectory(value);

    if (success) {
      console.log(`✓ Working directory set to: ${value}\n`);
    } else {
      console.error("❌ Failed to set working directory\n");
      process.exit(1);
    }
  } else {
    console.error(`❌ Unknown config key: ${key}`);
    console.error("Available keys: workdir, working-directory\n");
    process.exit(1);
  }
}

/**
 * Get a specific config value
 */
export async function getConfig(key: string) {
  await requireAuth();

  if (key === "workdir" || key === "working-directory") {
    const workingDir = await getWorkingDirectory();

    if (workingDir) {
      console.log(workingDir);
    } else {
      console.log("(not set)");
    }
  } else {
    console.error(`❌ Unknown config key: ${key}`);
    console.error("Available keys: workdir, working-directory\n");
    process.exit(1);
  }
}

/**
 * List all devices for the current user
 */
export async function listDevices() {
  await requireAuth();

  const devices = await getDevices();
  const currentDeviceId = getDeviceInfo().deviceId;

  if (devices.length === 0) {
    console.log("\n📱 No devices found\n");
    return;
  }

  console.log("\n📱 Your Devices");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  for (const device of devices) {
    const isCurrent = device.deviceId === currentDeviceId;
    const marker = isCurrent ? "● " : "  ";

    console.log(`${marker}${device.deviceName}`);
    console.log(`  Device ID: ${device.deviceId}`);
    if (device.hostname) {
      console.log(`  Hostname:  ${device.hostname}`);
    }
    if (device.platform) {
      console.log(`  Platform:  ${device.platform}`);
    }
    if (device.lastUsedAt) {
      const lastUsed = new Date(device.lastUsedAt);
      console.log(`  Last used: ${lastUsed.toLocaleString()}`);
    }
    console.log();
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("● = Current device\n");
}
