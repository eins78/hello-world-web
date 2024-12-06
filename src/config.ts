import { join } from "node:path";
const { default: packageJson } = await import("../package.json", { with: { type: "json" } });

const { env } = process;
const SERVER_STARTUP = new Date();

const version = semverFromPackage();

const config = {
  version,
  startupTime: SERVER_STARTUP.toISOString(),
  httpPort: env.PORT || "9999",
  basePath: join(env.BASE_PATH || "", "/"),
} as const satisfies Record<string, string>;

export default config;

// helper
function semverFromPackage() {
  return String(packageJson.version || "0.0.0-no.version.found");
}
