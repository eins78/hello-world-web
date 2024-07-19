import { defineConfig } from "cypress";
import { exec } from "child_process";

export default defineConfig({
  e2e: {
    specPattern: "**/*.test.ts",
    setupNodeEvents(on, _config) {
      // Start the Express server
      const server = exec("node ../bin/www");

      server.stdout &&
        server.stdout.on("data", (data) => {
          console.log(`Server: ${data}`);
        });

      server.stderr &&
        server.stderr.on("data", (data) => {
          console.error(`Server Error: ${data}`);
        });

      // Ensure the server is killed when tests are done
      on("after:run", () => {
        server.kill();
      });
    },
  },
});
