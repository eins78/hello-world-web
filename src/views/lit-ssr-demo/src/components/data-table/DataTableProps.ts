import type { ServerRenderedTemplate } from "@lit-labs/ssr";

export type TableData = {
  headers: string[];
  rows: string[][];
  captionHtml?: string;
};

export type DataTableProps = {
  tableData: TableData;
  caption?: string;
  displayMode?: DisplayMode;
};

export const DisplayModes = ["table", "csv", "json"] as const;
export type DisplayMode = (typeof DisplayModes)[number];
