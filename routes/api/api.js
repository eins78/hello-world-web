// @ts-check
const express = require("express");
const router = express.Router();
const config = require("../../config");
const { getClientInfo } = require("../../lib/client-info/clientInfo");

router.use(function delayMiddleware(req, res, next) {
  const delay = parseInt(String(req.query.delay), 10) || 0;
  setTimeout(next, delay);
});

/* GET config */
router.get("/config", function (req, res, next) {
  restReponse(res, config);
});

/* GET timestamp */
router.get("/time", function (req, res) {
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
