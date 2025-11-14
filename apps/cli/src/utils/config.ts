import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

interface CliConfig {
  authToken?: string;
  refreshToken?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".commis");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export async function ensureConfigDir(): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
}

export async function getConfig(): Promise<CliConfig> {
  try {
    await ensureConfigDir();
    if (await fs.pathExists(CONFIG_FILE)) {
      return await fs.readJson(CONFIG_FILE);
    }
    return {};
  } catch (error) {
    return {};
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await ensureConfigDir();
  const config = await getConfig();
  config.authToken = token;
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export async function setTokens(token: string, refreshToken: string): Promise<void> {
  await ensureConfigDir();
  const config = await getConfig();
  config.authToken = token;
  config.refreshToken = refreshToken;
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export async function getRefreshToken(): Promise<string | undefined> {
  const config = await getConfig();
  return config.refreshToken;
}

export async function getAuthToken(): Promise<string | undefined> {
  const config = await getConfig();
  return config.authToken;
}

export async function clearAuthToken(): Promise<void> {
  await ensureConfigDir();
  const config = await getConfig();
  delete config.authToken;
  delete config.refreshToken;
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export async function clearConfig(): Promise<void> {
  if (await fs.pathExists(CONFIG_FILE)) {
    await fs.remove(CONFIG_FILE);
  }
}
