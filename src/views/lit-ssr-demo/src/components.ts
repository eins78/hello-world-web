export { EpochCounterComponent } from "./components/epoch-counter.js";


/**
 * imports lit components (lazy-loaded) and registers them as custom elements
 */
export const registerCustomElements = async () => {
  return Promise.all([
    import("./components/app-shell.js"),
    import("./components/epoch-counter.js"),
    import("./components/simple-counter/simple-counter.js"),
  ]);
};

export const lazyLoadAppShell = async () => {
  return import("./components/app-shell.js");
};
