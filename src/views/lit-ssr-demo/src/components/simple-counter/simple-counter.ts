import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

console.log("Hello from simple-counter.ts!");

export type SimpleCounterProps = { initialCount: number };

// renders the epoch-counter element with the given props.
// will be called in the browser with the same props as on the server to hydrate the component.
export const SimpleCounterComponent = ({ initialCount }: SimpleCounterProps) =>
  html`<simple-counter .count="${initialCount}"></simple-counter>`;

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

  @property({ type: Number, attribute: "initial-count" })
  initialCount = -1;

  // initialize the `count` state from the server-rendered attribute in markup
  // TODO: is there a better way to this with `lit`?
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
      <span id="count">${count}</span></pre>
      <button ?disabled=${!this.hydrated} @click=${() => this.count && this.count++}>Increment</button>
    </article>`;
  }
}

const toNumber = (value: string | undefined) => (typeof value === "string" ? parseInt(value, 10) : undefined);
