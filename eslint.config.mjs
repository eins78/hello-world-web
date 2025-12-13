import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import playwright from "eslint-plugin-playwright";
import jsonEslint from "@eslint/json";
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

  // browser components config
  {
    files: ["packages/lit-ssr-demo/src/components/**/*.ts", "packages/app/public/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // tests config
  // - playwright
  // - testing-library (not yet compatible with eslint flat config)
  {
    files: ["packages/e2e-tests/**/*.*s"],
    ...playwright.configs["flat/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      playwright,
      "testing-library": fixupPluginRules({
        rules: testingLibrary.rules,
      }),
    },
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      ...testingLibrary.configs.dom.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Disable no-standalone-expect for BDD step definitions
      "playwright/no-standalone-expect": "off",
    },
  },

  // lint JSON files
  { files: ["**/*.json"], language: "json/json", ...jsonEslint.configs.recommended },
  { files: ["**/*tsconfig*.json"], language: "json/jsonc" },

  // ignore generated files and local config
  {
    ignores: [
      "node_modules",
      ".pnpm-store",
      "packages/app/dist",
      "packages/lit-ssr-demo/lib",
      "packages/e2e-tests/.features-gen",
      "packages/e2e-tests/playwright-report",
      "packages/e2e-tests/test-results",
      ".claude",
    ],
  },

  // Prettier configuration, should be last
  eslintPluginPrettierRecommended,
];
