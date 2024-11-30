import { Router, type Response } from "express";
import config from "../../config.js";
import { getClientInfo } from "../../support/client-info/clientInfo.js";

export const apiRouter: Router = Router();

/* GET config */
apiRouter.get("/config", function (_req, res) {
  restReponse(res, "config", config);
});

/* GET timestamp */
apiRouter.get("/time", function (_req, res) {
  const now = new Date();
  restReponse(res, "now", now);
});

/* GET client info */
apiRouter.all("/client/", function (req, res) {
  const client = getClientInfo(req);
  restReponse(res, "client", client);
});

apiRouter.all("/client/:field", function (req, res) {
  const { field } = req.params;
  const client = getClientInfo(req) as Record<string, unknown>;
  restReponse(res, field, client[field] || null);
});

function restReponse(res: Response, key: string, data: object | null) {
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
