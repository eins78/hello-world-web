#!/usr/bin/env node --experimental-fetch --no-warnings

const URL = process.env.HEALTHCHECK_URL || `http://localhost:${process.env.PORT || 9999}/\?healthcheck`;

function fail(error) {
  console.log(`FAIL: ${URL}\n${[error.message, error.cause].filter(Boolean).join("\n")}`);
  process.exit(1);
}

process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);

const response = await fetch(URL);
if (!response.ok) fail(await response.text());

console.log(`OK: ${URL}`);
