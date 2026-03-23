/**
 * Runtime detection utilities for Node.js vs Deno
 */

// Type-safe runtime detection
declare const Deno: typeof globalThis.Deno | undefined;

export const isDeno = typeof Deno !== "undefined";
export const isNode = typeof process !== "undefined" && !isDeno;
export const runtime = isDeno ? "deno" : "node";

/**
 * Get runtime version information
 */
export function getRuntimeInfo() {
  if (isDeno && Deno) {
    return {
      runtime: "deno" as const,
      version: Deno.version.deno,
      v8: Deno.version.v8,
      typescript: Deno.version.typescript,
    };
  } else {
    return {
      runtime: "node" as const,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }
}
