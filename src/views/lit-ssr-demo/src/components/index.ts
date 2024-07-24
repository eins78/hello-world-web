export { SimpleCounter } from "./simple-counter/simple-counter.js";
export { EpochCounterComponent } from "./epoch-counter/epoch-counter.js";
export { DataTableComponent } from "./data-table/data-table.js";

/**
 * imports lit components (lazy-loaded) and registers them as custom elements
 */
export const registerCustomElements = async () => {
  return Promise.all([lazyLoadAppShell(), lazyLoadEpochCounter(), lazyLoadSimpleCounter(), lazyLoadDataTable()]);
};

// lazy loaders for all components

export const lazyLoadAppShell = async () => import("./app-shell/app-shell.js");

export const lazyLoadEpochCounter = async () => import("./app-shell/app-shell.js");

export const lazyLoadSimpleCounter = async () => import("./app-shell/app-shell.js");

export const lazyLoadDataTable = async () => import("./data-table/data-table.js");
