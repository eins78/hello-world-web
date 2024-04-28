// @ts-check
import { html } from "@lit-labs/ssr";

/**
 * @type {import("../../lib/render-view/renderView.js").ServerComponentProps}
 */
export const bodyProps = {
  title: "Hello, SSR!",
  date: new Date().toISOString(),
};

/**
 * @type {import("../../lib/render-view/renderView.js").ServerComponent}
 * @param {import("../../lib/render-view/renderView.js").ServerComponentProps} props
 */
export const Body = (props) => {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${props.title}</title>
      </head>
      <body>
        <h1>${props.date}</h1>
      </body>
    </html>
  `;
};
