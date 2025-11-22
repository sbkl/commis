import { Table } from "convex-helpers/server";
import { zodToConvex } from "convex-helpers/server/zod4";
import {
  codeFeatureFileSchema,
  codeFeatureSchema,
} from "@commis/schemas/codeFeatures";

export const CodeFeatures = Table(
  "codeFeatures",
  zodToConvex(codeFeatureSchema).fields
);

export const CodeFeatureFiles = Table(
  "codeFeatureFiles",
  zodToConvex(codeFeatureFileSchema).fields
);
