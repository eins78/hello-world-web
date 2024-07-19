/**
 * Lit SSR Demo
 * based on https://github.com/lit/lit/tree/045b6f159815edb9e690bc1f6829d467f42aa520/packages/labs/ssr#server-only-templates
 */

import { html } from "@lit-labs/ssr";
import { registerComponents } from "./lit-ssr-demo/lib/server/entry-server.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

await registerComponents();

/**
 * @see https://mathiasbynens.be/notes/json-dom-csp#script
 * @param {import("../support/json.js").JSON} json - JSON object to encode
 */
const encodeJsonObjectForScriptTag = (json) =>
  JSON.stringify(json)
    .replace(/<\/script>/g, "<\\/script>")
    .replace(/</g, "\\u003c");

/**
 * @type {import("../support/render-view/renderView.js").ServerTemplate}
 * @param {import("../support/json.d.ts").JsonObject} props
 */
export const LitSsrDemo = (props) => {
  const { basePath } = props;
  const pageInfo = {
    serverTime: new Date().toISOString(),
    serverEpoch: Math.floor(Date.now() / 1000),
    appData: props,
  };

  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>lit-ssr-demo</title>
        <link rel="stylesheet" href="${basePath}stylesheets/style.css" />
      </head>
      <body>
        <h1>lit-ssr-demo</h1>

        <app-shell name="app-shell">
          <p>static content from server</p>
          <div slot="main">
            <epoch-counter initial-count=${pageInfo.serverEpoch}></epoch-counter>
          </div>
        </app-shell>

        <script type="module">
          const client = await import("./entry-client.js");
          const { registerComponents } = client;

          // Load and hydrate all components lazily
          registerComponents();

          // read data passed from server (needed for the second part of the demo)
          const parseTextJsonNode = (id) => {
            const encodedJson = document.getElementById(id || "page-info").textContent;
            const tmp = document.createElement("textarea");
            tmp.innerHTML = encodedJson;
            return JSON.parse(tmp.value);
          };
          const pageInfo = parseTextJsonNode("page-info");
          console.log("pageInfo", pageInfo);
        </script>

        <!-- Pass data from server to client. -->
        <script type="text/json" id="page-info">
          ${unsafeHTML(encodeJsonObjectForScriptTag(pageInfo))}
        </script>
      </body>
    </html>
  `;
};
