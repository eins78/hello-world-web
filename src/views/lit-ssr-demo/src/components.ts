export { EpochCounterComponent } from "./components/epoch-counter.js";
export { DataTableComponent } from "./components/data-table.js";

/**
 * imports lit components (lazy-loaded) and registers them as custom elements
 */
export const registerCustomElements = async () => {
  return Promise.all([
    import("./components/app-shell.js"),
    import("./components/epoch-counter.js"),
    import("./components/data-table.js"),
  ]);
};

export const lazyLoadAppShell = async () => {
  return import("./components/app-shell.js");
};
