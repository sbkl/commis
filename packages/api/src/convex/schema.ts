import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { Users } from "./users/table";
import { Projects } from "./projects/table";

const schema = defineSchema({
  ...authTables,
  users: Users.table.index("email", ["email"]),
  projects: Projects.table.index("slug", ["slug", "userId"]),
});

export default schema;
