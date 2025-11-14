import { userSchema, userWorkingDirectorySchema } from "@commis/schemas/users";
import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod";

export const Users = Table("users", zodToConvex(userSchema).fields);

export const UserWorkingDirectories = Table(
  "userWorkingDirectories",
  zodToConvex(userWorkingDirectorySchema).fields
);
