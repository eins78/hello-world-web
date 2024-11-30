import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

console.log("Hello from app-shell.ts!");

/**
 * @public
 */
@customElement("app-shell")
export class AppShell extends LitElement {
  static styles = css`
    p {
      color: tomato;
    }
    slot::slotted(*) {
      outline: 1px solid gold;
      outline-offset: 0.4rem;
    }
  `;

  render() {
    return html`<div>
      <p>default slot:</p>
      <slot></slot>

      <p>"main" slot:</p>
      <slot name="main"></slot>
    </div>`;
  }
}
