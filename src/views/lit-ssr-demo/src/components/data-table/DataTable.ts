import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DataTableStyles } from "./DataTable.styles.js";
import { DataTableProps, DisplayMode, DisplayModes, TableData } from "./DataTableProps.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

console.log("Hello from data-table.ts!");

export const DataTableComponent = ({ tableData, caption }: DataTableProps) =>
  html`<data-table ?has-data=${!!tableData} .tableData=${tableData}
    >${caption ? html`<div slot="caption">${unsafeHTML(caption)}</div>` : nothing}</data-table
  >`;

/**
 * @public
 */
@customElement("data-table")
export class DataTable extends LitElement {
  static styles = DataTableStyles;

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
      (mode) => html`
        <label
          ><input
            type="radio"
            id=${`dm-${mode}`}
            name="display-mode"
            value=${mode}
            ?checked=${this.displayMode === mode}
            @change=${() => (this.displayMode = mode)}
          />${mode}</label
        >
      `,
    );
  }

  renderContent(displayMode: DisplayMode, tableData: TableData) {
    switch (displayMode) {
      case "table":
        return html`<table>
          <caption>
            <slot name="caption"></slot>
            <p>Table has ${tableData?.rows.length || 0} rows, ${tableData?.headers.length || 0} columns.</p>
          </caption>
          <thead>
            <tr>
              ${tableData?.headers.length > 0 ? html`<th aria-label="number">#</th>` : nothing}
              ${tableData?.headers.map((header, _index) => html`<th>${header}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${tableData?.rows.map(
              (row, index) =>
                html`<tr>
                  <th scope="row">${index + 1}</th>
                  ${row.map((cell) => html`<td>${cell}</td>`)}
                </tr>`,
            )}
          </tbody>
        </table>`;
      case "csv":
        return html`<textarea id="display-csv" readonly rows=${tableData?.headers.length + 2}>
${this.tableDataToCsv()}</textarea
        >`;
      case "json": {
        const string = JSON.stringify(tableData, null, 2);
        const lineLength = string.split("\n").length + 1;
        return html`<textarea id="display-json" readonly rows=${lineLength}>${string}</textarea>`;
      }
    }
  }

  render() {
    const tableData = this.tableData!;
    console.log("DataTableComponent.render() called!", {
      hydrated: this.hydrated,
      displayMode: this.displayMode,
      tableData: this.tableData,
    });

    return html`<div id="container">
      <div id="introduction"><slot></slot></div>
      <div id="toolbar">${this.renderToolbar()}</div>
      <div id="content">${this.renderContent(this.displayMode, tableData)}</div>
    </div>`;
  }
}
