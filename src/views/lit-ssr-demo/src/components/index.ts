export { EpochCounterComponent } from "./epoch-counter/index.js";
export { DataTableComponent } from "./data-table/index.js";

// lazy loaders for all components

export const lazyLoadAppShell = async () => import("./app-shell/index.js");

export const lazyLoadEpochCounter = async () => import("./epoch-counter/index.js");

export const lazyLoadSimpleCounter = async () => import("./simple-counter/index.js");

export const lazyLoadDataTable = async () => import("./data-table/index.js");

/**
 * imports lit components (lazy-loaded) and registers them as custom elements
 */
export const registerCustomElements = async () => {
  return Promise.all([lazyLoadAppShell(), lazyLoadEpochCounter(), lazyLoadSimpleCounter(), lazyLoadDataTable()]);
};
