import { clearAuthToken, getAuthToken } from "../utils/config";
import { client } from "../client";
import { api } from "@commis/api/src/convex/_generated/api";

export async function logout(): Promise<void> {
  console.log("🔓 Logging out...\n");

  // Handle Ctrl+C gracefully
  const cleanup = () => {
    console.log("\n\n⚠️  Logout cancelled.");
    client.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    // Get the current token before clearing it
    const token = await getAuthToken();

    if (token) {
      // Revoke the token from the database
      try {
        await client.mutation(api.apiTokens.mutation.revokeToken, { token });
      } catch (error) {
        console.log(
          "⚠️  Could not revoke token from server (it may already be deleted)"
        );
      }
    }

    // Clear the local token
    await clearAuthToken();

    console.log("✓ Successfully logged out.");
    console.log("Run 'commis login' to authenticate again.\n");

    client.close();
  } catch (error) {
    console.error("❌ Failed to logout:", error);
    client.close();
    process.exit(1);
  }
}
