import { Table } from "convex-helpers/server";
import { authenticationSchema } from "@commis/schemas/authentications";
import { zodToConvex } from "convex-helpers/server/zod4";

export const Authentications = Table(
  "authentications",
  zodToConvex(authenticationSchema).fields
);
