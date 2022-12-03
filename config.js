const { env } = process;
const SERVER_STARTUP = new Date();

const version = semverFromEnv();

const config = { version, startupTime: SERVER_STARTUP, httpPort: env.PORT };
module.exports = config;

// helper
function semverFromEnv() {
  const { VERSION, PRE_RELEASE, BUILD } = process.env;
  return formatSemver(VERSION, PRE_RELEASE, BUILD);
}
function formatSemver(version, preRelease, build) {
  // https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
  return [[version, preRelease].filter(Boolean).join("-"), build].filter(Boolean).join("+");
}
