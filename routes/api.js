const express = require("express");
const router = express.Router();
const htmlTemplate = require("../views/html");
const homeTemplate = require("../views/home");

/* GET config */
const config = require("../config");
router.get("/config", function (req, res, next) {
  res.json(config);
});

/* GET timestamp */
router.get("/time", function (req, res, next) {
  const now = new Date();
  res.json({ now });
});

module.exports = router;
