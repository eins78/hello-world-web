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
    input: ["src/entry-server.ts"],
    output: {
      dir: "lib/server/",
      format: "es",
      sourcemap: true,
    },
    external: ["lit", "lit/decorators.js"],
    plugins: [typescript({ tsconfig: "./tsconfig.server.json" })],
  },
];
