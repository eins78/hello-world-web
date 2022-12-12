// @ts-check
const express = require("express");
const router = express.Router();
const htmlTemplate = require("../../views/html");
const homeTemplate = require("../../views/home");

router.use(function delayMiddleware(req, res, next) {
  const delay = parseInt(String(req.query.delay), 10) || 0;
  setTimeout(next, delay);
});

/* GET config */
const config = require("../../config");
router.get("/config", function (req, res, next) {
  res.json(config);
});

/* GET timestamp */
router.get("/time", function (req, res) {
  const now = new Date();
  res.json({ now });
});

/* POST echo */
router.post("/echo", function (req, res) {
  const echo = req.body;
  res.json({ echo });
});

/* GET hang */
router.get("/hang", function (req, res) {
  while (true) {}
  res.json({ message: "hang ended" });
});

/* GET redirect */
if (!process.env.HWW_NO_REDIRECTS) {
  router.get("/redirect", function (req, res, next) {
    //redirect
  });
}

/* GET status */
router.all("/http-status/:number", function (req, res, next) {
  const fallbackStatusCode = 499;
  let statusCode = fallbackStatusCode;
  try {
    statusCode = parseInt(req.params.number, 10);
    res.status(statusCode).send({ statusCode });
  } catch (error) {
    res.status(fallbackStatusCode).send({ statusCode: fallbackStatusCode, error });
  }
});

module.exports = router;
