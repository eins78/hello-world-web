// @ts-check
const express = require("express");
const router = express.Router();
const config = require("../../config");
const { getClientInfo } = require("../../lib/client-info/clientInfo");

/* GET config */
router.get("/config", function (req, res, next) {
  restReponse(res, config);
});

/* GET timestamp */
router.get("/time", function (req, res, next) {
  const now = new Date();
  restReponse(res, "now", now);
});

/* GET client */
router.all("/client/", function (req, res, next) {
  const client = getClientInfo(req);
  restReponse(res, "client", client);
});

router.all("/client/:field", function (req, res, next) {
  const { field } = req.params;
  const client = getClientInfo(req);
  restReponse(res, field, client[field] || null);
});

module.exports = router;

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
