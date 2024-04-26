const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const config = require("./config");
const indexRouter = require("./routes/home");
const apiRouter = require("./routes/api");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(config.basePath, express.static(path.join(__dirname, "public")));

app.use(path.join(config.basePath, "/"), indexRouter);
app.use(path.join(config.basePath, "/api"), apiRouter);

module.exports = app;
