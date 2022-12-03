const express = require("express");
const router = express.Router();
const htmlTemplate = require("../views/html");
const homeTemplate = require("../views/home");

/* GET home page. */
router.get("/", function (req, res, next) {
  const { env } = process;
  const version = [env.VERSION, env.PRE_RELEASE].filter(Boolean).join("-");
  const pageData = { title: "Hello World", jsonData: { version, httpPort: env.PORT } };
  res.send(
    htmlTemplate({
      title: "Hello World",
      bodyContent: homeTemplate(pageData),
    })
  );
});

module.exports = router;

// helper
function formatSemver(version, preRelease, build) {
  // https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
  [[version, preRelease].filter(Boolean).join("-"), build].filter(Boolean).join("+");
}
