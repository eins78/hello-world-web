/**
 * Copies `public/` to `dist/public/` and adds a content-hashed copy of every file next to it
 * (`stylesheets/style.css` → `stylesheets/style-1a2b3c4d.css`). `dist/public/manifest.json` maps
 * each original path to its hashed path. In production the server serves `dist/public/` and marks
 * the hashed files as immutable (see `src/support/static-assets/staticAssets.ts`).
 */
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(appDir, "public");
const outputDir = path.join(appDir, "dist", "public");

rmSync(outputDir, { recursive: true, force: true });
cpSync(sourceDir, outputDir, { recursive: true });

const manifest: Record<string, string> = {};
for (const entry of readdirSync(sourceDir, { recursive: true, encoding: "utf8" }).sort()) {
  const sourceFile = path.join(sourceDir, entry);
  if (!statSync(sourceFile).isFile()) continue;

  const hash = createHash("sha256").update(readFileSync(sourceFile)).digest("hex").slice(0, 8);
  const { dir, name, ext } = path.parse(entry);
  const hashedEntry = path.join(dir, `${name}-${hash}${ext}`);
  copyFileSync(sourceFile, path.join(outputDir, hashedEntry));
  manifest[entry.split(path.sep).join("/")] = hashedEntry.split(path.sep).join("/");
}

writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`dist/public: ${Object.keys(manifest).length} files hashed`);
