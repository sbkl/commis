import { v } from "convex/values";
import { protectedMutation, publicMutation } from "../functions";
import { ConvexError } from "convex/values";
import { hashToken } from "./utils";

export const deleteToken = protectedMutation({
  args: {
    tokenId: v.id("apiTokens"),
  },
  handler: async (ctx, args) => {
    const currentUser = ctx.user;

    const token = await ctx.db.get(args.tokenId);
    if (!token) {
      throw new ConvexError("Token not found");
    }

    if (token.userId !== currentUser._id) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.tokenId);
    return { success: true };
  },
});

export const revokeToken = publicMutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Hash the incoming token to find the matching record
    const tokenHash = await hashToken(args.token);
    
    const apiToken = await ctx.db
      .query("apiTokens")
      .withIndex("token", (q) => q.eq("token", tokenHash))
      .first();

    if (apiToken) {
      await ctx.db.delete(apiToken._id);
    }

    return { success: true };
  },
});
