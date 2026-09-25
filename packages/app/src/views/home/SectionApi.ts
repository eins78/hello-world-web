import { html } from "@lit-labs/ssr";

type TableRowProps = {
  name: string;
  method: string;
  path: string;
  description: string;
};

const TableRow = ({ name, method, path, description }: TableRowProps) => html`
  <tr>
    <td>${name}</td>
    <td>${method}</td>
    <td><a href=${path}>${path}</a></td>
    <td>
      <small>${description}</small>
    </td>
  </tr>
`;

/**
 * @typedef {Object} SectionApiProps
 * @property {string} basePath
 */

/**
 * @type {import("../../support/render-view/renderView.js").ServerTemplate}
 * @param {SectionApiProps} props
 */
export const SectionApi = ({ basePath = "/" }) => {
  return html`
    <h2 id="api">HTTP API</h2>

    <table>
      <thead>
        <tr>
          <th>name</th>
          <th>method</th>
          <th>path</th>
          <th>description</th>
        </tr>
      </thead>
      <tbody>
        ${TableRow({
          name: "config",
          method: "GET",
          path: `${basePath}api/config`,
          description: "config as shown above",
        })}
        ${TableRow({
          name: "client",
          method: "GET",
          path: `${basePath}api/client`,
          description: "client info as shown above",
        })}
        ${TableRow({
          name: "time",
          method: "GET",
          path: `${basePath}api/time`,
          description: 'current time, e.g. "2001-01-01T01:01:01.001Z"',
        })}
      </tbody>
    </table>
  `;
};
