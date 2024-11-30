import { join } from "node:path";

const { env } = process;
const SERVER_STARTUP = new Date();

const version = semverFromEnv();

const config = {
  version,
  startupTime: SERVER_STARTUP.toISOString(),
  httpPort: env.PORT || "9999",
  basePath: join(env.BASE_PATH || "", "/"),
} as const satisfies Record<string, string>;

export default config;

// helper
function semverFromEnv() {
  const { VERSION, PRE_RELEASE, BUILD } = process.env;
  return formatSemver(VERSION, PRE_RELEASE, BUILD);
}

function formatSemver(version: string = "0.0.0-no.version.found", preRelease?: string, build?: string) {
  // https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
  return [[version, preRelease].filter(Boolean).join("-"), build].filter(Boolean).join("+");
}
