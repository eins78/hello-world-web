// @ts-check

import { readFileSync } from "node:fs";
import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { html } from "@lit-labs/ssr";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDocs = (/** @type {string} */ basePath) => {
  const templateString = readFileSync(join(__dirname, "./home/section-api.html"));
  const props = { basePath };
  const values = Object.values(props).map((val) => String(val));
  return new Function(...Object.keys(props), `return \`${templateString}\`;`)(...values);
};

/**
 * @typedef {Object} HomeProps
 * @property {string} title
 * @property {Record<string,string>} config
 * @property {import('../lib/client-info/clientInfo.js').getClientInfo | {}} client
 */

/**
 * @type {import("../lib/render-view/renderView.js").ServerComponent}
 * @param {HomeProps} props
 */
export const Home = ({ title = "Title", config = {}, client = {} }) => {
  const clientInfo = { ...client, headers: undefined, trailers: undefined };
  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };

  return html`
    <h1>${title}</h1>

    <h2>info</h2>

    <details open>
      <summary>config</summary>
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

    ${unsafeHTML(apiDocs(config.basePath))}
  `;
};
