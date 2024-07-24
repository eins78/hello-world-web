import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

console.log("Hello from data-table.ts!");

type TableData = {
  headers: string[];
  rows: string[][];
  captionHtml?: string;
};

type DataTableProps = {
  tableData: TableData;
  displayMode?: DisplayMode;
};

export const DataTableComponent = ({ tableData }: DataTableProps) =>
  html`<data-table ?has-data=${!!tableData} .tableData=${tableData}></data-table>`;

export const DisplayModes = ["table", "csv", "json"] as const;
export type DisplayMode = (typeof DisplayModes)[number];

@customElement("data-table")
export class DataTable extends LitElement {
  static styles = css`
    .container {
      min-width: 16rem;
      width: fit-content;
      margin: 0 auto;
      overflow-x: auto;
      overflow-y: scroll;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      border: 1px solid var(--color-text);
      padding: 0.2em 0.8em;
      text-align: center;
      vertical-align: text-top;
    }
    tr:hover,
    tr:focus-within {
      color: var(--color-contrast);
    }

    caption {
      caption-side: bottom;
      font-style: italic;
      padding: 0.8em;
      padding-bottom: 0.4em;
    }
    caption p {
      margin: 0;
    }
    #toolbar {
      display: grid;
      grid-template-columns: repeat(3, auto);
      gap: 0.8em;
      justify-content: space-between;
    }
    #toolbar label input {
      margin-right: 0.8em;
    }
    #content textarea {
      color: var(--color-text);
      background-color: var(--color-background);
      border: 1px solid var(--color-contrast);
      width: 100%;
      height: 100%;
      font-family: monospace;
      padding: 0.8em;
      resize: none;
    }
  `;

  // @state({ hasChanged: () => false })
  private hydrated: boolean = false;

  @state()
  private tableData: TableData | undefined;

  @property({ type: String, attribute: "display-mode", reflect: true })
  public displayMode: DisplayMode = "table";

  firstUpdated() {
    this.hydrated = true;
  }

  tableDataToCsv() {
    const csvLines = [this.tableData?.headers.join(",")].concat(this.tableData?.rows.map((row) => row.join(",")));
    return csvLines.join("\n");
  }

  renderToolbar() {
    return DisplayModes.map(
      (mode) =>
        html` <label
          ><input
            type="radio"
            id=${`dm-${mode}`}
            name="display-mode"
            value=${mode}
            ?checked=${this.displayMode === mode}
            @change=${() => (this.displayMode = mode)}
          />${mode}</label
        >`
    );
  }

  renderContent(displayMode: DisplayMode, tableData: TableData) {
    switch (displayMode) {
      case "table":
        return html`<table>
          <caption>
            <p>${unsafeHTML(tableData?.captionHtml)}</p>
            <p>Table has ${tableData?.rows.length || 0} rows, ${tableData?.headers.length || 0} columns.</p>
          </caption>
          <thead>
            <tr>
              ${tableData?.headers.length > 0 ? html`<th aria-label="number">#</th>` : nothing}
              ${tableData?.headers.map((header, index) => html`<th>${header}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${tableData?.rows.map(
              (row, index) =>
                html`<tr>
                  <th scope="row">${index + 1}</th>
                  ${row.map((cell) => html`<td>${cell}</td>`)}
                </tr>`
            )}
          </tbody>
        </table>`;
      case "csv":
        return html`<textarea id="display-csv" readonly rows=${tableData?.headers.length + 2}>
${this.tableDataToCsv()}</textarea
        >`;
      case "json":
        const string = JSON.stringify(tableData, null, 2);
        const lineLength = string.split("\n").length + 1;
        return html`<textarea id="display-json" readonly rows=${lineLength}>${string}</textarea>`;
    }
  }

  render() {
    const tableData = this.tableData!;
    console.log("DataTableComponent.render() called!", {
      hydrated: this.hydrated,
      displayMode: this.displayMode,
      tableData: this.tableData,
    });

    return html`<div class="container">
      <div id="toolbar">${this.renderToolbar()}</div>
      <div id="content">${this.renderContent(this.displayMode, tableData)}</div>
    </div>`;
  }
}
