/**
 * Lit SSR Demo
 * based on https://github.com/lit/lit/tree/045b6f159815edb9e690bc1f6829d467f42aa520/packages/labs/ssr#server-only-templates
 */

import { html } from "@lit-labs/ssr";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import {
  DataTableComponent,
  EpochCounterComponent,
  registerCustomElements,
} from "../../src/views/lit-ssr-demo/lib/server/entry-server.js";
import type { JSON, JsonObject } from "../support/json.js";
import type { ServerTemplate } from "../support/render-view/renderView.js";

await registerCustomElements();

/**
 * @see https://mathiasbynens.be/notes/json-dom-csp#script
 */
const encodeJsonObjectForScriptTag = (json: JSON) =>
  JSON.stringify(json)
    .replace(/<\/script>/g, "<\\/script>")
    .replace(/</g, "\\u003c");

export const LitSsrDemo: ServerTemplate = (props: JsonObject) => {
  const { basePath } = props;
  const pageInfo = {
    serverTime: new Date().toISOString(),
    serverEpoch: Math.floor(Date.now() / 1000),
    appData: props,
    fruitDataTable: {
      headers: ["Name", "Color"],
      rows: [
        ["Apple", "Red"],
        ["Banana", "Yellow"],
        ["Grape", "Purple"],
      ],
    },
  } as const satisfies JSON;

  return html`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>lit-ssr-demo</title>
        <link rel="stylesheet" href="${basePath}stylesheets/style.css" />
      </head>
      <body>
        <header>
          <h1>lit-ssr-demo</h1>
          <p class="small">
            This is a demo of server-side rendering with <code><a target="_blank" href="https://lit.dev">Lit</a></code
            >. The server rendered the initial content which is "hydrated" (made interactive) on the client. See
            <a target="_blank" href="https://github.com/lit/lit/tree/main/packages/labs/ssr#lit-labsssr"
              >official docs</a
            >
            for details.
          </p>
        </header>

        <app-shell name="app-shell">
          <p>static content from server</p>

          <div slot="main">
            <div id="simple-counter"><simple-counter count="0"></simple-counter></div>
            <hr class="spacer" />

            <div id="epoch-counter">${EpochCounterComponent({ initialCount: pageInfo.serverEpoch })}</div>
            <hr class="spacer" />

            <div id="data-table-01">
              ${DataTableComponent({
                tableData: pageInfo.fruitDataTable,
                caption: `Those are some <strong style="text-decoration:underline">tasty</strong> fruits.`,
              })}
            </div>
            <hr class="spacer" />

            <div id="data-table-02">
              <data-table><blockquote>DataTable example 2: no data is given</blockquote></data-table>
            </div>
          </div>
        </app-shell>

        <script type="module">
          const clientModule = await import("./entry-client.js");
          const { litHydrate, lazyLoadAppShell, lazyLoadSimpleCounter, EpochCounterComponent, DataTableComponent } =
            clientModule;
          // helper function to read data passed from server in <script type="text/json"> tag
          const parseTextJsonNode = (id) => {
            const encodedJson = document.getElementById(id || "page-info").textContent;
            const tmp = document.createElement("textarea");
            tmp.innerHTML = encodedJson;
            const value = tmp.value;
            tmp.remove();
            return JSON.parse(tmp.value);
          };

          // Load and hydrate app-shell lazily (has no input data)
          lazyLoadAppShell();

          // Load and hydrate app-shell lazily (gets input data from attributes in the custom element HTML markup)
          lazyLoadSimpleCounter();

          const pageInfo = parseTextJsonNode("page-info");
          console.log("pageInfo", pageInfo);

          // Hydrate epoch-counter template.
          litHydrate(
            EpochCounterComponent({ initialCount: pageInfo.serverEpoch }),
            document.querySelector("#epoch-counter"),
          );
          // #epoch-counter element can now be efficiently updated

          // Hydrate data-table-01 template.
          litHydrate(
            DataTableComponent({ tableData: pageInfo.fruitDataTable }),
            document.querySelector("#data-table-01"),
          );
          // #data-table-01 element can now be efficiently updated
        </script>

        <!-- Pass data from server to client. -->
        <script type="text/json" id="page-info">
          ${unsafeHTML(encodeJsonObjectForScriptTag(pageInfo))}
        </script>
      </body>
    </html>
  `;
};
