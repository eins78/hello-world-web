#!/usr/bin/env node

// @ts-check

/**
 * Module dependencies.
 */
import path from "path";
import { fileURLToPath } from "node:url";
import initDebug from "debug";
import { createServer } from "node:http";
import { config as loadEnv } from "dotenv";
import config from "../config.js";
import app from "../app.js";

const { basePath } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * load configuration from .env files (supplementing environment vars)
 */
loadEnv({ path: path.resolve(__dirname, "../.env") });
loadEnv({ path: path.resolve(__dirname, "../VERSION.env") });
const debug = initDebug("hello-world-web:server");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "9999");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

debug("Starting server on port", port);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  const fmtUrl = (host) => `http://${host}:${addr.port}${basePath}`;
  var bind = typeof addr === "string" ? "pipe " + addr : `${fmtUrl("localhost")} | ${fmtUrl("0.0.0.0")} |`;
  console.log("Listening on " + bind, addr);
}
