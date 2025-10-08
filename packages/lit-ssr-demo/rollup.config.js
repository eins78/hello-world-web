import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default [
  // for (modern) browsers
  {
    input: "src/entry-client.ts",
    output: {
      dir: "lib/client/",
      format: "es",
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: "./tsconfig.client.json" })],
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
