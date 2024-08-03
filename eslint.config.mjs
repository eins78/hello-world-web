// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginCypress from "eslint-plugin-cypress";
import pluginCypressFlat from "eslint-plugin-cypress/flat";
import testingLibrary from "eslint-plugin-testing-library";
import { fixupPluginRules } from "@eslint/compat";

export default tseslint.config(
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
  { ignores: ["src/views/lit-ssr-demo/lib"] }
);
