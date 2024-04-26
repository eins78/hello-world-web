// @ts-check

const fs = require("node:fs");
const path = require("node:path");
const config = require("../config");

const apiDocs = (/** @type {string} */ basePath) => {
  const templateString = fs.readFileSync(path.join(__dirname, "./home/section-api.html"));
  const props = { basePath };
  const values = Object.values(props).map((val) => String(val));
  return new Function(...Object.keys(props), `return \`${templateString}\`;`)(...values);
};

/**
 * @param {{title?: string; config?: Record<string,string>, client?: import('../lib/client-info/clientInfo').getClientInfo | {}}} viewConfig
 */
module.exports = ({ title = "Title", config = {}, client = {} }) => {
  const clientInfo = { ...client, headers: undefined, trailers: undefined };
  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };

  return `
  <h1>${title}</h1>

  <h2>info</h2>

  <details open><summary>config</summary>
  <pre>${JSON.stringify(config, null, 2)}</pre>
  </details>

  <details>
    <summary>client info</summary>
    <pre>${JSON.stringify(clientInfo, null, 2)}</pre>

    <details>
      <summary>headers and trailers</summary>
      <pre>${JSON.stringify(headersAndTrailers, null, 2)}</pre>
    </details>
  </details>

  ${apiDocs(config.basePath)}

`.trim();
};
