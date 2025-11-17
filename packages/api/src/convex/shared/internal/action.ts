import { ConvexError, v } from "convex/values";
import { internalAction } from "../../functions";

export const testConvexApi = internalAction({
  args: {
    accessToken: v.string(),
    teamId: v.number(),
  },
  handler: async (_ctx, args) => {
    const res = await fetch(
      `https://api.convex.dev/v1/teams/${args.teamId}/list_projects`,
      {
        headers: {
          Authorization: `Bearer ${args.accessToken}`,
        },
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new ConvexError(
        `Failed to test Convex API: ${res.statusText} - ${errorText}`
      );
    }
    return await res.json();
  },
});
