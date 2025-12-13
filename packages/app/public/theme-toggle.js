/**
 * @typedef {"light" | "dark" | "system"} Theme
 */

const STORAGE_KEY = "theme-preference";

class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    /** @type {ShadowRoot} */
    this._shadowRoot = this.shadowRoot || this.attachShadow({ mode: "open" });
    /** @type {Theme} */
    this.currentTheme = "system";
    /** @type {MediaQueryList | null} */
    this.mediaQuery = null;

    // Load theme from storage and apply immediately
    this.loadThemeFromStorage();
    this.applyTheme(this.currentTheme);
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.setupMediaQueryListener();
  }

  disconnectedCallback() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleMediaQueryChange);
    }
  }

  loadThemeFromStorage() {
    if (typeof localStorage === "undefined") return;
    const stored = /** @type {Theme | null} */ (localStorage.getItem(STORAGE_KEY));
    this.currentTheme = stored || "system";
  }

  setupMediaQueryListener() {
    if (typeof window === "undefined") return;
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaQuery.addEventListener("change", this.handleMediaQueryChange);
  }

  handleMediaQueryChange = () => {
    if (this.currentTheme === "system") {
      this.applyTheme("system");
    }
  };

  /**
   * @param {Theme} theme
   */
  applyTheme(theme) {
    if (typeof document === "undefined") return;
    const html = document.documentElement;

    if (theme === "system") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", theme);
    }
  }

  /**
   * @param {Theme} theme
   */
  selectTheme(theme) {
    this.currentTheme = theme;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    this.applyTheme(theme);
    this.updateActiveButton();
  }

  updateActiveButton() {
    const buttons = this._shadowRoot.querySelectorAll("button");
    buttons.forEach((button) => {
      const buttonTheme = /** @type {Theme} */ (button.dataset.theme);
      if (buttonTheme === this.currentTheme) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  attachEventListeners() {
    const buttons = this._shadowRoot.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const theme = /** @type {Theme} */ (button.dataset.theme);
        this.selectTheme(theme);
      });
    });
    this.updateActiveButton();
  }

  render() {
    // If declarative shadow DOM exists, don't override
    if (this._shadowRoot.querySelector(".theme-toggle")) {
      return;
    }

    this._shadowRoot.innerHTML = `
      <style>
        .theme-toggle {
          display: inline-flex;
          gap: 0.5em;
          align-items: center;
          font-family: monospace;
        }

        button {
          font-family: inherit;
          font-size: 1em;
          padding: 0.25em 0.75em;
          border: 1px solid currentColor;
          background: transparent;
          color: inherit;
          cursor: pointer;
          border-radius: 4px;
          transition:
            background-color 0.2s,
            color 0.2s;
        }

        button:hover {
          opacity: 0.8;
        }

        button.active {
          background-color: var(--color-contrast);
          color: var(--color-bg);
        }
      </style>
      <div class="theme-toggle">
        <span>Theme:</span>
        <button data-theme="light" aria-label="Light theme">☀️ Light</button>
        <button data-theme="dark" aria-label="Dark theme">🌙 Dark</button>
        <button data-theme="system" aria-label="System theme">💻 System</button>
      </div>
    `;
  }
}

customElements.define("theme-toggle", ThemeToggle);
