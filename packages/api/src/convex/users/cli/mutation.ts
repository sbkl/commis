import { v } from "convex/values";
import { cliProtectedMutation } from "../../functions";

/**
 * Set or update the working directory for the current device
 */
export const setWorkingDirectory = cliProtectedMutation({
  args: {
    deviceId: v.string(),
    directory: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a working directory already exists for this user/device combination
    const existing = await ctx.db
      .query("userWorkingDirectories")
      .withIndex("userId_device", (q) =>
        q.eq("userId", ctx.user._id).eq("device", args.deviceId)
      )
      .first();

    if (existing) {
      // Update existing directory
      await ctx.db.patch(existing._id, {
        directory: args.directory,
      });
      return { updated: true, id: existing._id };
    } else {
      // Create new directory entry
      const id = await ctx.db.insert("userWorkingDirectories", {
        userId: ctx.user._id,
        device: args.deviceId,
        directory: args.directory,
      });
      return { updated: false, id };
    }
  },
});

/**
 * Delete the working directory for the current device
 */
export const deleteWorkingDirectory = cliProtectedMutation({
  args: {
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userWorkingDirectories")
      .withIndex("userId_device", (q) =>
        q.eq("userId", ctx.user._id).eq("device", args.deviceId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { deleted: true };
    }

    return { deleted: false };
  },
});
