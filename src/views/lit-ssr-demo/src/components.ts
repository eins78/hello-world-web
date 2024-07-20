export { epochCounterComponent } from "./components/epoch-counter.js";

export const registerComponents = async () => {
  import("./components/app-shell.js");
  import("./components/epoch-counter.js");
};

export const lazyLoadAppShell = async () => {
  import("./components/app-shell.js");
};
