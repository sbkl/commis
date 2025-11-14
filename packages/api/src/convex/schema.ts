import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { Users, UserWorkingDirectories } from "./users/table";
import { Projects } from "./projects/table";
import { CliAuthSessions } from "./cliAuth/table";
import { ApiTokens } from "./apiTokens/table";

const schema = defineSchema({
  ...authTables,
  users: Users.table.index("email", ["email"]),
  projects: Projects.table.index("slug", ["slug", "userId"]),
  cliAuthSessions: CliAuthSessions.table
    .index("userCode", ["userCode"])
    .index("deviceCode", ["deviceCode"]),
  apiTokens: ApiTokens.table
    .index("token", ["token"])
    .index("refreshToken", ["refreshToken"])
    .index("userId", ["userId"])
    .index("userId_deviceId", ["userId", "deviceId"]),
  userWorkingDirectories: UserWorkingDirectories.table.index("userId_device", [
    "userId",
    "device",
  ]),
});

export default schema;
