import compression from "compression";
import cookieParser from "cookie-parser";
import express, { json, urlencoded, type Express } from "express";
import logger from "morgan";
import path from "node:path";

import config from "./config.ts";
import { apiRouter } from "./routes/api/index.ts";
import indexRouter from "./routes/home.ts";
import litSsrDemoRouter from "./routes/lit-ssr-demo.ts";
import { clientDir, publicDir, setStaticCacheHeaders } from "./support/static-assets/staticAssets.ts";

const { basePath } = config;

const app: Express = express();

// gzip responses (Cloud Run does not compress for us); default threshold skips bodies under 1 KB
app.use(compression());

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

// app static files; content-hashed files are cached for a year, the rest revalidate (ETag)
app.use(basePath, express.static(publicDir, { setHeaders: setStaticCacheHeaders }));
// demo static files (the Rollup client bundle, all content-hashed)
app.use(path.join(basePath, "lit-ssr-demo"), express.static(clientDir, { setHeaders: setStaticCacheHeaders }));

// app routes
app.use(path.join(basePath, "/"), indexRouter);
app.use(path.join(basePath, "/api"), apiRouter);
app.use(path.join(basePath, "/"), litSsrDemoRouter);

export default app;
