"use node";

import type { JwtPayload } from "jsonwebtoken";
import { v } from "convex/values";
import jwt from "jsonwebtoken";

import { internal } from "../../_generated/api";

import { internalAction } from "../../functions";
import { env } from "../../env";
import { generateRandomCode } from "../utils";

export const processPendingToken = internalAction({
  args: {
    apiTokenId: v.id("apiTokens"),
  },
  handler: async (ctx, args) => {
    const apiToken = await ctx.runQuery(
      internal.apiTokens.internal.query.find,
      {
        apiTokenId: args.apiTokenId,
      }
    );
    // const accessToken = `sk_${randomBytes(32).toString("base64url")}`;
    const accessToken = generateRandomCode(64);

    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 365; // 1 year

    const token = jwt.sign(
      {
        data: {
          userId: apiToken.userId,
          name: apiToken.name,
          token: accessToken,
          userName: apiToken.user.name,
          userEmail: apiToken.user.email,
        },
      } as JwtPayload,
      env.JWT_SECRET,
      { expiresIn: expiresAt }
    );

    await ctx.runMutation(internal.apiTokens.internal.mutation.finalise, {
      token,
      apiTokenId: args.apiTokenId,
      expiresAt,
      refreshToken: apiToken.refreshToken,
      refreshExpiresAt: apiToken.refreshExpiresAt,
    });

    return "success";
  },
});

export const decode = internalAction({
  args: {
    token: v.string(),
  },
  handler: async (_ctx, { token }) => {
    let accessToken;
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      accessToken = decoded["data"].token;

      if (!accessToken) {
        return { error: "No access token in JWT", success: false };
      }
      return { accessToken, success: true };
    } catch (e) {
      console.log(e);
      return { error: "Could not verify JWT", success: false };
    }
  },
});
