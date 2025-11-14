import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const CliAuthSessions = Table("cliAuthSessions", {
  deviceCode: v.string(),
  userCode: v.string(),
  userId: v.optional(v.id("users")),
  expiresAt: v.number(),
  verified: v.boolean(),
});
