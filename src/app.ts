import cookieParser from "cookie-parser";
import express, { json, urlencoded, type Express } from "express";
import logger from "morgan";
import { fileURLToPath } from "node:url";
import path from "path";

import config from "./config.ts";
import { apiRouter } from "./routes/api/index.ts";
import indexRouter from "./routes/home.ts";
import litSsrDemoRouter from "./routes/lit-ssr-demo.ts";

const { basePath } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(basePath, express.static(path.join(__dirname, "..", "public")));

app.use(path.join(basePath, "/"), indexRouter);
app.use(path.join(basePath, "/api"), apiRouter);
app.use(path.join(basePath, "/"), litSsrDemoRouter);

export default app;
