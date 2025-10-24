#!/usr/bin/env -S node --experimental-strip-types --experimental-transform-types

import path from "node:path";
const BASE_PATH = path.join(process.env.BASE_PATH || "", "/");
const URL =
  process.env.HEALTHCHECK_URL || `http://localhost:${process.env.PORT || 9999}${BASE_PATH}api/time?healthcheck`;

function fail(error: Error | { message: string; cause: string }) {
  console.log(`FAIL: ${[URL, error.message, error.cause].filter((i) => i).join("\n")}`);
  process.exit(1);
}

process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);

const response = await fetch(URL);
if (!response.ok) fail({ message: `HTTP status ${response.status}`, cause: await response.text() });

console.log(`OK: ${URL}`);
