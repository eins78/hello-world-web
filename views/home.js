// @ts-check
const fs = require("fs");
const path = require("path");
const apiDocs = fs.readFileSync(path.join(__dirname, "./home/section-api.html"));

module.exports = ({ title = "Title", config = {}, client = {} }) =>
  `
  <h1>${title}</h1>

  <h2>config</h2>
  <pre>${JSON.stringify(config, 0, 2)}</pre>

  <h2>client</h2>
  <pre>${JSON.stringify(client, 0, 2)}</pre>

  ${apiDocs}

`.trim();
