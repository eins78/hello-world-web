// @ts-check

import { readFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDocs = (/** @type {string} */ basePath) => {
  const templateString = readFileSync(join(__dirname, "./home/section-api.html"));
  const props = { basePath };
  const values = Object.values(props).map((val) => String(val));
  return new Function(...Object.keys(props), `return \`${templateString}\`;`)(...values);
};

/**
 * @param {{title?: string; config?: Record<string,string>, client?: import('../lib/client-info/clientInfo').getClientInfo | {}}} viewConfig
 */
export default ({ title = "Title", config = {}, client = {} }) => {
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
