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

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

// app static files
app.use(basePath, express.static(path.join(__dirname, "..", "public")));
// demo static files
app.use(
  path.join(basePath, "lit-ssr-demo"),
  express.static(path.dirname(require.resolve("@hello-world-web/lit-ssr-demo/client"))),
);

// app routes
app.use(path.join(basePath, "/"), indexRouter);
app.use(path.join(basePath, "/api"), apiRouter);
app.use(path.join(basePath, "/"), litSsrDemoRouter);

export default app;
