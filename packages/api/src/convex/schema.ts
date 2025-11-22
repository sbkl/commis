import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { UserConfigs, Users, UserWorkingDirectories } from "./users/table";
import { Projects } from "./projects/table";
import { CliAuthSessions } from "./cliAuth/table";
import { ApiTokens } from "./apiTokens/table";
import { UiComponents, UiComponentsOnProjects } from "./uiComponents/table";
import { CodeFeatures, CodeFeatureFiles } from "./codeFeatures/table";
import { Authentications } from "./authentications/table";

const schema = defineSchema({
  ...authTables,
  users: Users.table.index("email", ["email"]),
  userConfigs: UserConfigs.table.index("userId", ["userId"]),
  projects: Projects.table
    .index("slug", ["slug", "userId"])
    .index("userId", ["userId"])
    .index("status", ["status", "userId"])
    .searchIndex("name", {
      searchField: "name",
      filterFields: ["userId"],
    }),
  authentications: Authentications.table
    .index("projectId", ["projectId"])
    .index("userId", ["userId"])
    .index("status", ["status", "userId"]),
  cliAuthSessions: CliAuthSessions.table
    .index("code", ["code"])
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
  uiComponents: UiComponents.table
    .index("vendor", ["vendor"])
    .index("vendor_name", ["vendor", "name"])
    .searchIndex("name", {
      searchField: "name",
      filterFields: ["vendor"],
    }),
  uiComponentsOnProjects: UiComponentsOnProjects.table
    .index("projectId", ["projectId"])
    .index("projectId_uiComponentId", ["projectId", "uiComponentId"])
    .index("userId_status", ["userId", "status"]),
  codeFeatures: CodeFeatures.table
    .index("slug", ["slug"])
    .index("userId", ["userId"]),
  codeFeatureFiles: CodeFeatureFiles.table.index("codeFeatureId", [
    "codeFeatureId",
  ]),
  // authenticationProviders: AuthenticationProviders.table.index("provider", [
  //   "provider",
  // ]),
});

export default schema;
