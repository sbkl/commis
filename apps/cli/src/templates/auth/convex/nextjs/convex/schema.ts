// @ts-nocheck
import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { Users } from "@/convex/users/table";

const schema = defineSchema({
  ...authTables,
  users: Users.table.index("email", ["email"]),
});

export default schema;
