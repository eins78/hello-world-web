// @ts-check
const express = require("express");
const router = express.Router();
const config = require("../../config");
const { getClientInfo } = require("../../lib/client-info/clientInfo");

/* GET config */
router.get("/config", function (req, res, next) {
  res.json(config);
});

/* GET timestamp */
router.get("/time", function (req, res, next) {
  const now = new Date();
  res.json({ now });
});

/* GET client */
router.get("/client", function (req, res, next) {
  const client = getClientInfo(req);
  res.json({ client });
});

module.exports = router;
