// @ts-check
import eslint from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
// @ts-expect-error - no types available
import pluginCypress from "eslint-plugin-cypress";
import { fixupPluginRules } from "@eslint/compat";
// @ts-expect-error - no types available
import pluginCypressFlat from "eslint-plugin-cypress/flat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import testingLibrary from "eslint-plugin-testing-library";

export default [
  // recommended config
  eslint.configs.recommended,

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
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
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
    files: ["cypress/**/*.*s", "test/**/*.*s"],
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

  // ignore generated files
  { ignores: ["dist", "src/views/lit-ssr-demo/lib"] },

  // Prettier configuration, should be last
  eslintPluginPrettierRecommended,
];
