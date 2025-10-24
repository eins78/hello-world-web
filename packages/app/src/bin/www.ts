#!/usr/bin/env tsx

/**
 * Module dependencies.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import initDebug from "debug";
import { createServer } from "node:http";
import { config as loadEnv } from "dotenv";
import config from "../config.ts";
import app from "../app.ts";

const { basePath } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * load configuration from .env files (supplementing environment vars)
 */
loadEnv({ path: path.resolve(__dirname, "../.env") });
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

function normalizePort(val: string) {
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

function onError(error: { syscall: string; code: unknown }) {
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
  const addr = server.address();
  if (typeof addr === "string") {
    console.log("Listening on pipe " + addr);
  } else if (addr) {
    const fmtUrl = (host: string) => `http://${host}:${addr.port}${basePath}`;
    var bind = `${fmtUrl("localhost")} | ${fmtUrl("0.0.0.0")} |`;
    console.log("Listening on " + bind, addr);
  }
}
