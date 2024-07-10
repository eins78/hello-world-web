console.log("Hello from views/index.ts");

import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("app-shell")
export class AppShell extends LitElement {
  static styles = css`
    p {
      color: tomato;
    }
  `;

  @property()
  name = "Somebody";

  render() {
    return html` <p>Hello, ${this.name}!</p>
      <slot></slot>`;
  }
}
