// @ts-check

// uses `@lit-labs/ssr` to render static HTML on the server
// docs: https://github.com/lit/lit/tree/main/packages/labs/ssr#server-only-templates
import { Readable } from "node:stream";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";

/**
 * A `ServerComponent` is a pure function that takes a `props` object and returns a lit `ServerRenderedTemplate`
 * @typedef {function(ServerComponentProps): import("@lit-labs/ssr").ServerRenderedTemplate} ServerComponent
 */

// FIXME: fix types (no `any`)
/**
 * Props for a `ServerComponent`
 * x@typedef {Record<string,string|number|import("@lit-labs/ssr").ServerRenderedTemplate>} ServerComponentPropsBase
 * x@typedef {ServerComponentPropsBase|Record<string,ServerComponentPropsBase>} ServerComponentProps
 * @typedef {|Record<string,any>} ServerComponentProps
 */

/**
 * @internal
 * @param {ServerComponent} component - The server component to render.
 * @param {ServerComponentProps} props - The props to pass to the server component.
 * @returns {import("@lit-labs/ssr").RenderResult}
 */
const renderView = (component, props) => render(component(props));

/**
 * Renders a `ServerComponent` and their `props` to a (`Readable`) stream.
 * @param {ServerComponent} component - The server component to render.
 * @param {ServerComponentProps} props - The props to pass to the server component.
 * @returns {import("node:stream").Readable}
 */
export const renderViewToStream = (component, props) => {
  const ssrResult = renderView(component, props);
  return Readable.from(ssrResult);
};

/**
 * Renders a `ServerComponent` and their `props` to a string.
 * @param {ServerComponent} component - The server component to render.
 * @param {ServerComponentProps} props - The props to pass to the server component.
 * @returns {Promise<string>}
 */
export const renderViewToString = async (component, props) => {
  const ssrResult = renderView(component, props);
  return collectResult(ssrResult);
};
