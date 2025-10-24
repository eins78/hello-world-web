import { join } from "node:path";
const { default: packageJson } = await import("../package.json", { with: { type: "json" } });

const { env } = process;
const SERVER_STARTUP = new Date();

const version = semverFromPackage();

const config = {
  version,
  startupTime: SERVER_STARTUP.toISOString(),
  httpPort: env.PORT ?? "9999",
  basePath: join(env.BASE_PATH || "", "/"),
  content: {
    appName: "hello-world-web",
    appVersion: env.APP_VERSION ?? version,
    appUrl: env.APP_URL ?? "https://github.com/eins78/hello-world-web",
    appTitle: env.APP_TITLE ?? `Hello World!`,
    appDescription: env.APP_DESCRIPTION ?? "A simple web server for testing and debugging web infrastructure.",
    ciRunUrl: env.CI_RUN_URL, // Optional: link to CI run that deployed this version
    ciCommitSha: env.CI_COMMIT_SHA, // Optional: commit SHA that was deployed
    ciCommitTimestamp: env.CI_COMMIT_TIMESTAMP, // Optional: commit timestamp
  },
} as const;

export type Config = typeof config;
export default config;

// helper
function semverFromPackage() {
  return String(packageJson.version || "0.0.0-no.version.found");
}
