import { ConvexError, v } from "convex/values";
import { internalAction } from "../../functions";
import { internal } from "../../_generated/api";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

export const generateConvexAuthKeys = internalAction({
  args: {
    projectId: v.id("projects"),
    authenticationId: v.id("authentications"),
    convexDeploymentName: v.string(),
    accessToken: v.string(),
    clientId: v.string(),
    clientSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const url = `https://${args.convexDeploymentName}.convex.cloud/api/update_environment_variables`;
    const keys = await generateKeyPair("RS256", {
      extractable: true,
    });
    const privateKey = await exportPKCS8(keys.privateKey);
    const publicKey = await exportJWK(keys.publicKey);
    const JWKS = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

    const JWT_PRIVATE_KEY = `${privateKey.trimEnd().replace(/\n/g, " ")}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Convex ${args.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        changes: [
          {
            name: "SITE_URL",
            value: "http://localhost:3000",
          },
          {
            name: "AUTH_GITHUB_ID",
            value: args.clientId,
          },
          {
            name: "AUTH_GITHUB_SECRET",
            value: args.clientSecret,
          },
          {
            name: "JWKS",
            value: JWKS,
          },
          {
            name: "JWT_PRIVATE_KEY",
            value: JWT_PRIVATE_KEY,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new ConvexError(
        `Failed to generate Convex auth keys: ${res.statusText}`
      );
    }
    await ctx.runMutation(
      internal.authentications.internal.mutation.patchStatus,
      {
        authenticationId: args.authenticationId,
        status: "pending",
      }
    );
  },
});
