import { defineConfig } from "cypress";

// NOTE: server is started outside of cypress process (i.e. package scripts or CI config).
// * https://docs.cypress.io/guides/references/best-practices#Web-Servers
// * https://docs.cypress.io/guides/continuous-integration/introduction#Boot-your-server

const PORT = process.env.PORT || 9999;

export default defineConfig({
  e2e: {
    specPattern: "**/*.test.ts",
    baseUrl: `http://localhost:${PORT}`,
    env: {
      // list the files and file patterns to watch
      "cypress-watch-and-reload": {
        watch: ["../views/*"],
      },
    },
    setupNodeEvents(on, config) {
      // https://github.com/bahmutov/cypress-watch-and-reload
      // eslint-disable-next-line no-undef
      return require("cypress-watch-and-reload/plugins")(on, config);
    },
  },
});
