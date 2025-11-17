import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod";
import {
  uiComponentOnProjectSchema,
  uiComponentSchema,
} from "@commis/schemas/uiComponents";

export const UiComponents = Table(
  "uiComponents",
  zodToConvex(uiComponentSchema).fields
);

export const UiComponentsOnProjects = Table(
  "uiComponentsOnProjects",
  zodToConvex(uiComponentOnProjectSchema).fields
);
