import { defineConfig } from "cypress";
import { exec } from "node:child_process";

const PORT = process.env.PORT || 9999;

export default defineConfig({
  e2e: {
    specPattern: "**/*.test.ts",
    baseUrl: `http://localhost:${PORT}`,
    setupNodeEvents(on, _config) {
      // Start the Express server
      const server = exec(`PORT=${PORT} node ../bin/www`);

      server.stdout &&
        server.stdout.on("data", (data) => {
          console.log(`Server: ${data}`);
        });

      server.stderr &&
        server.stderr.on("data", (data) => {
          console.error(`Server Error: ${data}`);
        });

      // Ensure the server is stopped when tests are done
      on("after:run", () => {
        server.kill();
      });
    },
  },
});
