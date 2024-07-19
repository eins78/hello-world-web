// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
    },
  },
  eslint.configs.recommended,
  { ignores: ["views/lit-ssr-demo/lib"] }
);
