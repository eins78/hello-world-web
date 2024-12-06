import { css } from "lit";

export const DataTableStyles = css`
  #container {
    min-width: 16rem;
    width: fit-content;
    margin: 0 auto;
    padding: 0.2rem;
    border: 1px solid var(--color-contrast);
  }

  #introduction {
    padding: 0 1em;
  }

  #toolbar {
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 0.8em;
    justify-content: space-between;
  }
  #toolbar label {
    padding-right: 0.2em;
  }
  #toolbar label input {
    margin-right: 0.8em;
  }

  #content {
    display: grid;
  }
  #content textarea {
    color: var(--color-text);
    background-color: var(--color-bg);
    border: 1px solid var(--color-contrast);
    font-family: monospace;
    padding: 0.8em;
    resize: none;
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
