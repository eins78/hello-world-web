import compression from "compression";
import cookieParser from "cookie-parser";
import express, { json, urlencoded, type Express } from "express";
import logger from "morgan";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

import config from "./config.ts";
import { apiRouter } from "./routes/api/index.ts";
import indexRouter from "./routes/home.ts";
import litSsrDemoRouter from "./routes/lit-ssr-demo.ts";

const { basePath } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const app: Express = express();

// Enable gzip compression for all responses
app.use(compression());

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

// app static files with cache control
app.use(
  basePath,
  express.static(path.join(__dirname, "..", "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1y" : "0",
    immutable: process.env.NODE_ENV === "production",
  }),
);
// demo static files with cache control
app.use(
  path.join(basePath, "lit-ssr-demo"),
  express.static(path.dirname(require.resolve("@hello-world-web/lit-ssr-demo/client")), {
    maxAge: process.env.NODE_ENV === "production" ? "1y" : "0",
    immutable: process.env.NODE_ENV === "production",
  }),
);

// app routes
app.use(path.join(basePath, "/"), indexRouter);
app.use(path.join(basePath, "/api"), apiRouter);
app.use(path.join(basePath, "/"), litSsrDemoRouter);

// Production error handling middleware
// Handle 404 errors
app.use((req, res) => {
  res.status(404).send({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use(
  (err: Error & { status?: number }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // Log error in development
    if (process.env.NODE_ENV !== "production") {
      console.error(err);
    }

    // Send error response
    res.status(err.status || 500);
    res.send({
      error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  },
);

export default app;
