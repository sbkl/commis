import { v } from "convex/values";
import { publicQuery } from "../functions";
import { ConvexError } from "convex/values";

// Get device code session by user code (for the web UI)
export const getDeviceSession = publicQuery({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("cliAuthSessions")
      .withIndex("code", (q) => q.eq("code", args.code))
      .first();

    if (!session) {
      throw new ConvexError("Invalid code");
    }

    if (session.expiresAt < Date.now()) {
      throw new ConvexError("Code expired");
    }

    return {
      code: session.code,
      expiresAt: session.expiresAt,
      verified: session.verified,
    };
  },
});
