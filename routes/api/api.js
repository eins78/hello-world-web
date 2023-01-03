// @ts-check
const express = require("express");
const router = express.Router();
const config = require("../../config");
const { getClientInfo } = require("../../lib/client-info/clientInfo");
const { restReponse } = require("../../lib/rest-reponse/restReponse");
const cachedApi = require("./cached/cached.js");

router.use("/cached", cachedApi);

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
