import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

console.log("Hello from epoch-counter.ts!");

/**
 * @public
 */
export type EpochCounterProps = { initialCount: number };

// renders the epoch-counter element with the given props.
// will be called in the browser with the same props as on the server to hydrate the component.
export const EpochCounterComponent = ({ initialCount }: EpochCounterProps) =>
  html`<epoch-counter .count="${initialCount}"></epoch-counter>`;

/**
 * @public
 */
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

  @state()
  private count = -1;

  @state()
  private hydrated = false;

  firstUpdated() {
    this.hydrated = true;
  }

  render() {
    const count = this.count;
    return html`<article>
      <pre>current epoch when server rendered:<br><time>${count}</time></pre>
      <button ?disabled=${!this.hydrated} @click=${() => this.count && this.count++}>Increment</button>
    </article>`;
  }
}
