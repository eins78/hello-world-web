import { defineConfig } from "cypress";

// NOTE: server is started outside of cypress process (i.e. package scripts or CI config).
// * https://docs.cypress.io/guides/references/best-practices#Web-Servers
// * https://docs.cypress.io/guides/continuous-integration/introduction#Boot-your-server

const PORT = process.env.PORT || 9999;

export default defineConfig({
  e2e: {
    specPattern: "**/*.test.ts",
    baseUrl: `http://localhost:${PORT}`,
    setupNodeEvents(_on, _config) {},
  },
});
