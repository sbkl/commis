import "./commands/env";
import { dev } from "./commands/dev";
import { init } from "./commands/init";
import { login } from "./commands/login";
import { logout } from "./commands/logout";
import { whoami } from "./commands/whoami";
import {
  showConfig,
  setConfig,
  getConfig,
  listDevices,
} from "./commands/config";

if (require.main === module) {
  if (process.argv[2] === "dev") {
    dev().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
  if (process.argv[2] === "init") {
    init().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
  if (process.argv[2] === "login") {
    login().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
  if (process.argv[2] === "logout") {
    logout().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
  if (process.argv[2] === "whoami") {
    whoami().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
  if (process.argv[2] === "config") {
    const subcommand = process.argv[3];
    if (!subcommand || subcommand === "show") {
      showConfig().catch((err) => {
        console.error(err);
        process.exit(1);
      });
    } else if (subcommand === "set") {
      const key = process.argv[4];
      const value = process.argv[5];
      if (!key || !value) {
        console.error("Usage: commis config set <key> <value>");
        process.exit(1);
      }
      setConfig(key, value).catch((err) => {
        console.error(err);
        process.exit(1);
      });
    } else if (subcommand === "get") {
      const key = process.argv[4];
      if (!key) {
        console.error("Usage: commis config get <key>");
        process.exit(1);
      }
      getConfig(key).catch((err) => {
        console.error(err);
        process.exit(1);
      });
    } else {
      console.error("Unknown config subcommand. Use: show, set, or get");
      process.exit(1);
    }
  }
  if (process.argv[2] === "devices") {
    listDevices().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}
