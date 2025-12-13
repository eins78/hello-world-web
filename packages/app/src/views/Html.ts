import { html } from "@lit-labs/ssr";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

/**
 * @typedef {Object} HtmlProps
 * @property {string} htmlTitle
 * @property {string} bodyContent
 * @property {string} basePath
 */

/**
 * @type {import("../support/render-view/renderView.js").ServerTemplate}
 * @param {HtmlProps} props
 */
export const Html = ({ htmlTitle = "Title", bodyContent = "", basePath = "/" }) => {
  const scriptTag = `<script type="module" src="${basePath}theme-toggle.js"></script>`;

  return html`
    <!doctype html>
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
        ${bodyContent} ${unsafeHTML(scriptTag)}
      </body>
    </html>
  `;
};
