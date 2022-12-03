const express = require("express");
const router = express.Router();
const htmlTemplate = require("../views/html");
const homeTemplate = require("../views/home");

/* GET timestamp */
router.get("/time", function (req, res, next) {
  const now = new Date();
  res.json({ now });
});

module.exports = router;
