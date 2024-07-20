import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

console.log("Hello from data-table.ts!");

type TableData = {
  headers: string[];
  rows: string[][];
  captionHtml?: string;
};

type DataTableProps = {
  tableData: TableData;
};

export const DataTableComponent = ({ tableData }: DataTableProps) =>
  html`<data-table ?has-data=${!!tableData} .tableData=${tableData}></data-table>`;

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
  `;

  @state({ hasChanged: (value: TableData | undefined, oldValue: TableData | undefined) => true })
  private tableData: TableData | undefined;

  @state({ hasChanged: () => false })
  private hydrated: boolean = false;

  handleCsvButtonClick() {
    const csvLines = [this.tableData?.headers.join(",")].concat(this.tableData?.rows.map((row) => row.join(",")));
    alert("```csv\n" + csvLines.join("\n") + "\n```");
  }

  firstUpdated() {
    this.hydrated = true;
  }

  render() {
    const tableData = this.tableData!;
    console.log("DataTableComponent.render() called!", {
      this: this,
      hydrated: this.hydrated,
      tableData: this.tableData,
    });

    return html`<div class="container">
      <table>
        <caption>
          <p>${unsafeHTML(tableData?.captionHtml)}</p>
          <p>Table has ${tableData?.rows.length || 0} rows, ${tableData?.headers.length || 0} columns.</p>
          <div class="toolbar">
            <button id="show-csv-data" ?disabled=${!this.hydrated} @click=${this.handleCsvButtonClick}>
              Show CSV Data
            </button>
          </div>
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
      </table>
    </div>`;
  }
}
