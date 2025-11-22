// @ts-nocheck
import { userSchema } from "@/schemas/users";
import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod4";

export const Users = Table("users", zodToConvex(userSchema).fields);
