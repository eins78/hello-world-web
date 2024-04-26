// @ts-check
const express = require("express");
const router = express.Router();
const htmlTemplate = require("../views/html");
const homeTemplate = require("../views/home");
const config = require("../config");
const { getClientInfo } = require("../lib/client-info/clientInfo");
const title = process.env.APP_TITLE ?? "Hello World!";

/* GET home page. */
router.get("/", function (req, res, next) {
  const client = getClientInfo(req);
  const pageData = { title, config, client };
  res.send(
    htmlTemplate({
      htmlTitle: title,
      basePath: config.basePath,
      bodyContent: homeTemplate(pageData),
    })
  );
});

module.exports = router;
