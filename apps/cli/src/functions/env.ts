import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const possibleEnvPaths = [
  path.join(process.cwd(), "../.env.local"),
  path.join(process.cwd(), "../.env"),
  path.join(__dirname, "../../../../.env.local"), // From cli/dist to root
  path.join(__dirname, "../../../.env.local"), // From cli/src to root
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
