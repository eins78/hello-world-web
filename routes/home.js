const express = require("express");
const router = express.Router();
const htmlTemplate = require("../views/html");
const homeTemplate = require("../views/home");

/* GET home page. */
router.get("/", function (req, res, next) {
  const pageData = { title: "Hello World", jsonData: { hello: "world" } };
  res.send(
    htmlTemplate({
      title: "Hello World",
      bodyContent: homeTemplate(pageData),
    })
  );
});

module.exports = router;
