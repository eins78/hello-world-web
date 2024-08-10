import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

// usage: `<simple-counter count="1"></simple-counter>`;

console.log("Hello from simple-counter.ts!");

const toNumber = (value: string | undefined) => (typeof value === "string" ? parseInt(value, 10) : undefined);

@customElement("simple-counter")
export class SimpleCounter extends LitElement {
  static styles = css`
    article {
      text-align: center;
      border: 1px solid silver;
      padding: 1em 1em 2em;
    }
    #count {
      font-size: 2em;
    }
    button {
      font-family: inherit;
      font-size: 1.5em;
      font-weight: bold;
      padding: 0.5em 1em;
    }
  `;

  @property({ type: Number, attribute: "count", reflect: true })
  private count = toNumber(this?.attributes?.getNamedItem?.("count")?.value) || -1;

  @state()
  private hydrated = false;

  firstUpdated() {
    this.hydrated = true;
  }

  render() {
    const count = this.count;
    return html`<article>
      <span id="count">${count}</span></pre>
      <button ?disabled=${!this.hydrated} @click=${() => this.count++}>Increment</button>
    </article>`;
  }
}
