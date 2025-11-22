import {
  userConfigSchema,
  userSchema,
  userWorkingDirectorySchema,
} from "@commis/schemas/users";
import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod4";

export const Users = Table("users", zodToConvex(userSchema).fields);

export const UserWorkingDirectories = Table(
  "userWorkingDirectories",
  zodToConvex(userWorkingDirectorySchema).fields
);

export const UserConfigs = Table(
  "userConfigs",
  zodToConvex(userConfigSchema).fields
);
