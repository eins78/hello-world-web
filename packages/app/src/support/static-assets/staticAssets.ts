/**
 * Content-hashed static files.
 *
 * Two build steps write a manifest of hashed file names:
 * - `packages/app/scripts/build-public.ts` → `dist/public/manifest.json` (stylesheets, favicons, images)
 * - the Rollup client build of `@hello-world-web/lit-ssr-demo` → `lib/client/manifest.json`
 *   (read once at startup; `pnpm dev` restarts the server when it changes)
 *
 * Hashed files change name whenever their content changes, so they are served as immutable.
 * Everything else keeps `express.static`'s default (`max-age=0` plus ETag revalidation).
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ServerResponse } from "node:http";

const require = createRequire(import.meta.url);
const appDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

// app files: hashed copies in production (built by `pnpm run build`), plain `public/` in development
const useBuiltPublicDir = process.env.NODE_ENV === "production";
export const publicDir = useBuiltPublicDir ? path.join(appDir, "dist", "public") : path.join(appDir, "public");
const publicManifest: Record<string, string> = useBuiltPublicDir ? readJson(path.join(publicDir, "manifest.json")) : {};

// lit-ssr-demo client bundle: always content-hashed by Rollup
const clientManifestFile = require.resolve("@hello-world-web/lit-ssr-demo/client/manifest.json");
export const clientDir = path.dirname(clientManifestFile);
const clientManifest = readJson<{ entries: Record<string, string>; files: string[] }>(clientManifestFile);

/** File name of the client entry module, relative to `clientDir`. */
export const clientEntryFile = clientManifest.entries["entry-client.js"];

/** Path of an app static file relative to the site root, e.g. `stylesheets/style-1a2b3c4d.css`. */
export const publicAssetPath = (file: string): string => publicManifest[file] ?? file;

const immutableFiles = new Set([
  ...Object.values(publicManifest).map((file) => path.join(publicDir, file)),
  ...clientManifest.files.map((file) => path.join(clientDir, file)),
]);

/** `setHeaders` option for `express.static`: one year and `immutable` for hashed files only. */
export const setStaticCacheHeaders = (res: ServerResponse, filePath: string): void => {
  if (immutableFiles.has(filePath)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
};
