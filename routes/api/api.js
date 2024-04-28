// @ts-check
import { Router } from "express";
import config from "../../config.js";
import { getClientInfo } from "../../lib/client-info/clientInfo.js";

export const apiRouter = Router();

/* GET config */
apiRouter.get("/config", function (req, res, next) {
  restReponse(res, "config", config);
});

/* GET timestamp */
apiRouter.get("/time", function (req, res, next) {
  const now = new Date();
  restReponse(res, "now", now);
});

/* GET client */
apiRouter.all("/client/", function (req, res, next) {
  const client = getClientInfo(req);
  restReponse(res, "client", client);
});

apiRouter.all("/client/:field", function (req, res, next) {
  const { field } = req.params;
  const client = getClientInfo(req);
  restReponse(res, field, client[field] || null);
});

function restReponse(res, key, data) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  res.format({
    text() {
      res.send(text);
    },
    html() {
      res.send(text);
    },
    json() {
      res.json({ [key]: data });
    },
    default() {
      res.status(406).send("Not Acceptable");
    },
  });
}
