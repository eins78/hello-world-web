import express, { json, urlencoded } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import config from "./config.js";
import indexRouter from "./routes/home.js";
import { apiRouter } from "./routes/api/index.js";
import { fileURLToPath } from "node:url";

const { basePath } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(basePath, express.static(path.join(__dirname, "public")));

app.use(path.join(basePath, "/"), indexRouter);
app.use(path.join(basePath, "/api"), apiRouter);

export default app;
