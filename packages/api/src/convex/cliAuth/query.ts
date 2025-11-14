import { v } from "convex/values";
import { publicQuery } from "../functions";
import { ConvexError } from "convex/values";

// Get device code session by user code (for the web UI)
export const getDeviceSession = publicQuery({
  args: {
    userCode: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("cliAuthSessions")
      .withIndex("userCode", (q) => q.eq("userCode", args.userCode))
      .first();

    if (!session) {
      throw new ConvexError("Invalid user code");
    }

    if (session.expiresAt < Date.now()) {
      throw new ConvexError("Code expired");
    }

    return {
      userCode: session.userCode,
      expiresAt: session.expiresAt,
      verified: session.verified,
    };
  },
});
