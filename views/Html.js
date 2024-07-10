// @ts-check
import { html } from "@lit-labs/ssr";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import he from "he";

import "../public/js/index.js";

/**
 * @typedef {Object} HtmlProps
 * @property {string} htmlTitle
 * @property {string} bodyContent
 * @property {string} basePath
 */

/**
 * @type {import("../lib/render-view/renderView.js").ServerTemplate}
 * @param {HtmlProps} props
 */
export const Html = ({ htmlTitle = "Title", bodyContent = "", basePath = "/" }) => {
  const serverDate = new Date().toISOString();

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${htmlTitle}</title>
        <link rel="stylesheet" href="${basePath}stylesheets/style.css" />
        <link rel="icon" type="image/svg+xml" href="${basePath}favicon.svg" />
        <link rel="icon" type="image/png" href="${basePath}favicon.png" />
      </head>
      <body>
        <app-shell>
          <p>hello from server</p>
          ${bodyContent}
        </app-shell>

        <!-- <script type="importmap">
          {
            "imports": {
              "@lit-labs/ssr-client": "/node_modules/@lit-labs/ssr-client/index.js",
              "lit": "/node_modules/lit/index.js",
              "lit/decorators.js": "/node_modules/lit/decorators.js",
              "@lit/reactive-element": "/node_modules/@lit/reactive-element/index.js",
              "lit-element/lit-element.js": "/node_modules/lit-element/lit-element.js",
              "lit-html/is-server.js": "/node_modules/lit-html/is-server.js",
              "lit-html": "/node_modules/lit-html/lit-html.js",
              "lit-html/private-ssr-support.js": "/node_modules/lit-html/private-ssr-support.js",
              "lit-html/directive.js": "/node_modules/lit-html/directive.js",
              "lit-html/directive-helpers.js": "/node_modules/lit-html/directive-helpers.js"
            }
          }
        </script> -->
        <script type="module">
          // based on lit-ssr example
          // https://github.com/lit/lit/tree/045b6f159815edb9e690bc1f6829d467f42aa520/packages/labs/ssr#hydrating-litelements

          // Hydrate template-shadowroots eagerly after rendering (for browsers without
          // native declarative shadow roots)
          //import { hasNativeDeclarativeShadowRoots, hydrateShadowRoots } from "./js/template-shadowroot.js";
          //if (!hasNativeDeclarativeShadowRoots()) {
          //  hydrateShadowRoots(document.body);
          //}
          // ...
          // Load and hydrate app-shell lazily
          //import("\${unsafeHTML(String(basePath))}app-components.js");
          import("./js/index.js");

          // Hydrate content template. This <script type=module> will run after
          // the page has loaded, so we can count on page-id being present.
          //import { hydrate } from "@lit-labs/ssr-client";
          const pageInfo = JSON.parse(document.getElementById("page-info").textContent);
          console.log("pageInfo", pageInfo);
          //hydrate(getContent(pageInfo.description), document.querySelector("#content"));
          // #content element can now be efficiently updated
        </script>
        <script type="text/json" id="page-info">
          ${JSON.stringify({
            date: serverDate,
          })}
        </script>
      </body>
    </html>
  `;
};
