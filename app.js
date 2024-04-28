import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import logger from "morgan";
import { fileURLToPath } from "node:url";
import path from "path";

import config from "./config.js";
import { renderViewToString, renderViewToStream } from "./lib/render-view/renderView.js";
import { apiRouter } from "./routes/api/index.js";
import indexRouter from "./routes/home.js";
import { Body, bodyProps } from "./views/components/Html.js";

const { basePath } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('express').Express} */
const app = express();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(basePath, express.static(path.join(__dirname, "public")));

app.use(path.join(basePath, "/"), indexRouter);
app.use(path.join(basePath, "/api"), apiRouter);

// for quick testing of new rendering functions

app.get("/ssr", async (_, res) => {
  const html = await renderViewToString(Body, bodyProps);
  res.send(html);
});

app.get("/ssrs", (_, res) => {
  renderViewToStream(Body, bodyProps).pipe(res);
});

export default app;
