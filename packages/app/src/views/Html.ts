import { html } from "@lit-labs/ssr";
import { publicAssetPath } from "../support/static-assets/staticAssets.ts";

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
  return html`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${htmlTitle}</title>
        <link rel="stylesheet" href="${basePath}${publicAssetPath("stylesheets/style.css")}" />
        <link rel="icon" type="image/svg+xml" href="${basePath}${publicAssetPath("favicon.svg")}" />
        <link rel="icon" type="image/png" href="${basePath}${publicAssetPath("favicon.png")}" />
      </head>
      <body>
        ${bodyContent}
      </body>
    </html>
  `;
};
