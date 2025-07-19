import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
// @ts-expect-error - no types available
import pluginCypress from "eslint-plugin-cypress";
import jsonEslint from "@eslint/json";
// @ts-expect-error - no types available
import pluginCypressFlat from "eslint-plugin-cypress/flat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";

export default [
  // recommended config
  { files: ["**/*.{,c,m}{t,j}s{,x}"], ...eslint.configs.recommended },

  // nodejs
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
    },
  },

  // TypeScript configuration
  {
    files: ["**/*.{,c,m}{t,j}s{,x}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.lint.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      ...tsEslint.configs.recommended?.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // tests config
  // - cypress
  // - testing-library (not yet compatible with eslint flat config)
  {
    files: ["packages/e2e-tests/**/*.*s"],
    ...pluginCypressFlat.configs.recommended,
    plugins: {
      cypress: fixupPluginRules(pluginCypress),
      "testing-library": fixupPluginRules({
        rules: testingLibrary.rules,
      }),
    },
    rules: {
      ...testingLibrary.configs.dom.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // lint JSON files
  { files: ["**/*.json"], language: "json/json", ...jsonEslint.configs.recommended },
  { files: ["**/*tsconfig*.json"], language: "json/jsonc" },

  // ignore generated files
  { ignores: ["packages/app/dist", "packages/lit-ssr-demo/lib", "packages/e2e-tests/.features-gen"] },

  // Prettier configuration, should be last
  eslintPluginPrettierRecommended,
];
