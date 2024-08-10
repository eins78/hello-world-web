export { EpochCounterComponent } from "./epoch-counter/epoch-counter.js";
export { SimpleCounter } from "./simple-counter/simple-counter.js";

/**
 * imports lit components (lazy-loaded) and registers them as custom elements
 */
export const registerCustomElements = async () => {
  return Promise.all([lazyLoadAppShell(), lazyLoadEpochCounter(), lazyLoadSimpleCounter()]);
};

// lazy loaders for all components

export const lazyLoadAppShell = async () => import("./app-shell/app-shell.js");

export const lazyLoadEpochCounter = async () => import("./epoch-counter/epoch-counter.js");

export const lazyLoadSimpleCounter = async () => import("./simple-counter/simple-counter.js");
