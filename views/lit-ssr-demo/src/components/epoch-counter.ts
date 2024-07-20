import { html, css, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

console.log("Hello from epoch-counter.ts!");

const toNumber = (value: string | undefined) => (typeof value === "string" ? parseInt(value, 10) : undefined);

@customElement("epoch-counter")
export class EpochCounter extends LitElement {
  static styles = css`
    article {
      text-align: center;
      border: 1px solid silver;
      padding: 1em 1em 2em;
    }
    time {
      font-size: 2em;
    }
    button {
      font-family: inherit;
      font-size: 1.5em;
      font-weight: bold;
      padding: 0.5em 1em;
    }
  `;

  @property({ type: Number, attribute: "initial-count" })
  initialCount = -1;

  @state()
  private count = toNumber(this?.attributes?.getNamedItem?.("initial-count")?.value);

  @state()
  private hydrated = false;

  firstUpdated() {
    this.hydrated = true;
  }

  render() {
    const count = this.count ?? this.initialCount;
    return html`<article>
      <pre>current epoch when server rendered:<br><time>${count}</time></pre>
      <button ?disabled=${!this.hydrated} @click=${() => this.count && this.count++}>Increment</button>
    </article>`;
  }
}
