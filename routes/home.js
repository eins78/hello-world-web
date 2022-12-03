const express = require("express");
const router = express.Router();
const htmlTemplate = require("../views/html");
const homeTemplate = require("../views/home");
const config = require("../config");
const title = process.env.TITLE ?? "!!! MISSING $TITLE !!!";

/* GET home page. */
router.get("/", function (req, res, next) {
  const pageData = { title, config };
  res.send(
    htmlTemplate({
      title,
      bodyContent: homeTemplate(pageData),
    })
  );
});

module.exports = router;
