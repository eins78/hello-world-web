// @ts-check

// uses `@lit-labs/ssr` to render static HTML on the server
// docs: https://github.com/lit/lit/tree/main/packages/labs/ssr#server-only-templates
import { Readable } from "node:stream";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";

/**
 * A `ServerTemplate` is a pure function that takes a `props` object and returns a lit `ServerRenderedTemplate`
 * @typedef {function(ServerTemplateProps): import("@lit-labs/ssr").ServerRenderedTemplate} ServerTemplate
 */

// FIXME: fix types (no `any`)
/**
 * Props for a `ServerTemplate`
 * x@typedef {Record<string,string|number|import("@lit-labs/ssr").ServerRenderedTemplate>} ServerTemplatePropsBase
 * x@typedef {ServerTemplatePropsBase|Record<string,ServerTemplatePropsBase>} ServerTemplateProps
 * @typedef {|Record<string,any>} ServerTemplateProps
 */

/**
 * @internal
 * @param {ServerTemplate} template - The server template to render.
 * @param {ServerTemplateProps} props - The props to pass to the server template.
 * @returns {import("@lit-labs/ssr").RenderResult}
 */
const renderView = (template, props) => render(template(props));

/**
 * Renders a `ServerTemplate` and their `props` to a (`Readable`) stream.
 * @param {ServerTemplate} template - The server template to render.
 * @param {ServerTemplateProps} props - The props to pass to the server template.
 * @returns {import("node:stream").Readable}
 */
export const renderViewToStream = (template, props) => {
  const ssrResult = renderView(template, props);
  return Readable.from(ssrResult);
};

/**
 * Renders a `ServerTemplate` and their `props` to a string.
 * @param {ServerTemplate} template - The server template to render.
 * @param {ServerTemplateProps} props - The props to pass to the server template.
 * @returns {Promise<string>}
 */
export const renderViewToString = async (template, props) => {
  const ssrResult = renderView(template, props);
  return collectResult(ssrResult);
};
