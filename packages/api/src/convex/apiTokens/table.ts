import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const ApiTokens = Table("apiTokens", {
  userId: v.id("users"),
  token: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  name: v.string(),
  lastUsedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  refreshExpiresAt: v.optional(v.number()),
  // Device identification
  deviceId: v.optional(v.string()),
  deviceName: v.optional(v.string()),
  deviceHostname: v.optional(v.string()),
  devicePlatform: v.optional(v.string()),
});
