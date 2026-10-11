import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Writes `manifest.json` next to the client bundle: the content-hashed file name of each entry,
 * and the list of all emitted (hashed) JS chunks, which the app serves as immutable.
 * @returns {import("rollup").Plugin}
 */
const clientManifest = () => ({
  name: "client-manifest",
  generateBundle(_options, bundle) {
    const chunks = Object.values(bundle).filter((file) => file.type === "chunk");
    const entries = Object.fromEntries(
      chunks.filter((chunk) => chunk.isEntry).map((chunk) => [`${chunk.name}.js`, chunk.fileName]),
    );
    // source maps are left out: their content can change while the chunk hash stays the same
    const manifest = { entries, files: chunks.map((chunk) => chunk.fileName).sort() };
    this.emitFile({ type: "asset", fileName: "manifest.json", source: JSON.stringify(manifest, null, 2) });
  },
});

export default [
  // for (modern) browsers
  {
    input: "src/entry-client.ts",
    output: {
      dir: "lib/client/",
      format: "es",
      sourcemap: true,
      // content-hashed names, so the app can serve every client file as immutable
      entryFileNames: "[name]-[hash].js",
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.client.json" }),
      isProduction && terser(),
      clientManifest(),
    ].filter(Boolean),
  },

  // for server / nodejs
  {
    input: "src/entry-server.ts",
    output: {
      file: "lib/server/entry-server.js",
      format: "es",
      sourcemap: true,
      inlineDynamicImports: true,
    },
    external: ["lit", "lit/decorators.js", "lit/directives/unsafe-html.js"],
    plugins: [typescript({ tsconfig: "./tsconfig.server.json" })],
  },
];
