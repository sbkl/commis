import { projectSchema } from "@commis/schemas/projects";
import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod";

export const Projects = Table("projects", zodToConvex(projectSchema).fields);
