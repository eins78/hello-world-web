// @ts-check

import { html } from "@lit-labs/ssr";
import { SectionApi } from "./home/SectionApi.js";

/**
 * @typedef {Object} HomeProps
 * @property {string} title
 * @property {Record<string,string>} config
 * @property {import('../support/client-info/clientInfo.js').getClientInfo | {}} client
 */

/**
 * @type {import("../support/render-view/renderView.js").ServerTemplate}
 * @param {HomeProps} props
 */
export const Home = ({ title = "Title", config = {}, client = {} }) => {
  const clientInfo = { ...client, headers: undefined, trailers: undefined };
  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };
  const sectionApi = SectionApi({ basePath: config.basePath });

  return html`
    <h1>${title}</h1>

    <h2>Connection Information</h2>

    <details open>
      <summary>HTTP client summary</summary>
      <pre>${JSON.stringify(clientInfo, null, 2)}</pre>
    </details>

    <details>
      <summary>HTTP headers and trailers</summary>
      <pre>${JSON.stringify(headersAndTrailers, null, 2)}</pre>
    </details>

    <details>
      <summary>server config</summary>
      <pre>${JSON.stringify(config, null, 2)}</pre>
    </details>

    ${sectionApi}
  `;
};
