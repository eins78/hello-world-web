// uses `@lit-labs/ssr` to render static HTML on the server
// docs: https://github.com/lit/lit/tree/main/packages/labs/ssr#server-only-templates
import { render, type ServerRenderedTemplate } from "@lit-labs/ssr";
import { RenderResultReadable } from "@lit-labs/ssr/lib/render-result-readable.js";
import { collectResult, type RenderResult } from "@lit-labs/ssr/lib/render-result.js";

/**
 * A `ServerTemplate` is a pure function that takes a `props` object and returns a lit `ServerRenderedTemplate`
 */
export type ServerTemplate = (_props: ServerTemplateProps) => ServerRenderedTemplate;

// FIXME: fix types (no `any`), something like:
// * x@typedef {Record<string,string|number|import("@lit-labs/ssr").ServerRenderedTemplate>} ServerTemplatePropsBase
// * x@typedef {ServerTemplatePropsBase|Record<string,ServerTemplatePropsBase>} ServerTemplateProps
/**
 * Props for a `ServerTemplate`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServerTemplateProps = Record<string, any>;

/**
 * @internal
 * @returns {import("@lit-labs/ssr").RenderResult}
 */
const renderView = (template: ServerTemplate, props: ServerTemplateProps): RenderResult => render(template(props));

/**
 * Renders a `ServerTemplate` and their `props` to a (`Readable`) stream.
 */
export const renderViewToStream = (template: ServerTemplate, props: ServerTemplateProps): RenderResultReadable => {
  const ssrResult = renderView(template, props);
  return new RenderResultReadable(ssrResult);
};

/**
 * Renders a `ServerTemplate` and their `props` to a string.
 */
export const renderViewToString = async (template: ServerTemplate, props: ServerTemplateProps): Promise<string> => {
  const ssrResult = renderView(template, props);
  return collectResult(ssrResult);
};
