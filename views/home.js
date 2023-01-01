// @ts-check
const fs = require("fs");
const path = require("path");
const apiDocs = fs.readFileSync(path.join(__dirname, "./home/section-api.html"));

module.exports = ({ title = "Title", config = null }) =>
  `
  <h1>${title}</h1>

  <h2>config</h2>
  <pre>${JSON.stringify(config, 0, 2)}</pre>

  ${apiDocs}

`.trim();
