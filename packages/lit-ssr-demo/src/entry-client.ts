// NOTE: must be imported before loading any components
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";

// re-export hydrate from lit so client only needs to consume our entry point
export { hydrate as litHydrate } from "@lit-labs/ssr-client";

export * from "./components/index.js";
