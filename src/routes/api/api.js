// @ts-check
import { Router } from "express";
import config from "../../config.js";
import { getClientInfo } from "../../support/client-info/clientInfo.js";

export const apiRouter = Router();

/* GET config */
apiRouter.get("/config", function (_req, res) {
  restReponse(res, "config", config);
});

/* GET timestamp */
apiRouter.get("/time", function (_req, res) {
  const now = new Date();
  restReponse(res, "now", now);
});

/* GET client */
apiRouter.all("/client/", function (req, res) {
  const client = getClientInfo(req);
  restReponse(res, "client", client);
});

apiRouter.all("/client/:field", function (req, res) {
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
