import { getCurrentUser } from "../utils/auth";
import { getDeviceInfo, getWorkingDirectory } from "../utils/device";
import { client } from "../client";

export async function whoami(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    console.log("❌ Not authenticated.");
    console.log("Run 'commis login' to authenticate.\n");
    client.close();
    process.exit(1);
  }

  const deviceInfo = getDeviceInfo();
  const workingDir = await getWorkingDirectory();

  console.log("\n👤 Current User");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Name:  ${user.name || "N/A"}`);
  console.log(`  Email: ${user.email || "N/A"}`);
  console.log(`  ID:    ${user._id}`);
  console.log();
  console.log("📱 Current Device");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Device:            ${deviceInfo.deviceName}`);
  console.log(`  Device ID:         ${deviceInfo.deviceId}`);
  console.log(`  Working Directory: ${workingDir ?? "(not set)"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  client.close();
}
