import { client } from "../client";
import { api } from "@commis/api/src/convex/_generated/api";
import { setTokens } from "../utils/config";
import { getDeviceInfo } from "../utils/device";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function login(): Promise<void> {
  console.log("🔐 Initiating CLI authentication...\n");

  // Handle Ctrl+C gracefully
  const cleanup = () => {
    console.log("\n\n⚠️  Authentication cancelled.");
    client.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    // Collect device information
    const deviceInfo = getDeviceInfo();

    // Generate device code
    const deviceFlow = await client.mutation(
      api.cliAuth.mutation.generateDeviceCode,
      {}
    );

    console.log("Please verify this device:");
    console.log(`\n  Code: ${deviceFlow.code}\n`);
    console.log(
      `Opening browser to: ${deviceFlow.verificationUrl}?code=${deviceFlow.code}`
    );
    console.log("\nWaiting for verification...");

    // Open browser
    const url = `${deviceFlow.verificationUrl}?code=${deviceFlow.code}`;
    await openBrowser(url);

    // Poll for verification
    const maxAttempts = 60; // 5 minutes (60 * 5 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await sleep(5000); // Wait 5 seconds between polls

      try {
        const result = await client.mutation(
          api.cliAuth.mutation.pollDeviceCode,
          { deviceCode: deviceFlow.deviceCode, deviceInfo }
        );

        if (result.verified && result.token && result.refreshToken) {
          await setTokens(result.token, result.refreshToken);
          console.log("\n✓ Successfully authenticated!");
          console.log(`Device: ${deviceInfo.deviceName}\n`);
          client.close();
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("expired")) {
          console.error(
            "\n❌ Authentication code expired. Please try again.\n"
          );
          client.close();
          process.exit(1);
        }
        // Continue polling if code hasn't been verified yet
      }

      attempts++;
    }

    console.error("\n❌ Authentication timeout. Please try again.\n");
    client.close();
    process.exit(1);
  } catch (error) {
    console.error("\n❌ Authentication failed:", error);
    client.close();
    process.exit(1);
  }
}

async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let command: string;

  if (platform === "darwin") {
    command = `open "${url}"`;
  } else if (platform === "win32") {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  try {
    await execAsync(command);
  } catch (error) {
    console.log("\nCouldn't open browser automatically. Please visit:");
    console.log(`  ${url}\n`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
