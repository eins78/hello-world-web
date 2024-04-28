// @ts-check

import { html } from "@lit-labs/ssr";

/**
 * @typedef {Object} SectionApiProps
 * @property {string} basePath
 */

/**
 * @type {import("../../lib/render-view/renderView.js").ServerTemplate}
 * @param {SectionApiProps} props
 */
export const SectionApi = ({ basePath = "/" }) => {
  return html`
    <h2>API</h2>

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
        <tr>
          <td>config</td>
          <td>GET</td>
          <td><a href="${basePath}api/config">${basePath}api/config</a></td>
          <td>
            <small>config as shown above</code></small>
          </td>
        </tr>
        <tr>
          <td>client</td>
          <td>GET</td>
          <td><a href="${basePath}api/client">${basePath}api/client</a></td>
          <td>
            <small>client info as shown above</code></small>
          </td>
        </tr>
        <tr>
          <td>time</td>
          <td>GET</td>
          <td><a href="${basePath}api/time">${basePath}api/time</a></td>
          <td>
            <small>current time, e.g. <code>"2001-01-01T01:01:01.001Z"</code></small>
          </td>
        </tr>
      </tbody>
    </table>
  `;
};
