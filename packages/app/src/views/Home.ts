import { html } from "@lit-labs/ssr";
import { SectionApi } from "./home/SectionApi.ts";
import type { ClientInfo } from "../support/client-info/clientInfo.ts";
import type { Config } from "../config.ts";

export type HomeProps = {
  config: Config;
  client: ClientInfo;
};

export const Home = ({ config, client }: HomeProps) => {
  const { appTitle, appDescription, appUrl, appName, appVersion } = config.content;
  const clientInfo = { ...client, headers: undefined, trailers: undefined };

  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };

  const sectionApi = SectionApi({ basePath: config.basePath });

  return html`
    <h1>${appTitle}</h1>

    <p>${appDescription}</p>

    <h2 id="client">Connection Information</h2>

    <details open>
      <summary>HTTP client summary</summary>
      <pre>${JSON.stringify(clientInfo, null, 2)}</pre>
    </details>

    <details>
      <summary>HTTP headers and trailers</summary>
      <pre>${JSON.stringify(headersAndTrailers, null, 2)}</pre>
    </details>

    <details>
      <summary>server config</summary>
      <pre>${JSON.stringify(config, null, 2)}</pre>
    </details>

    <h2 id="demo">HTML Demos</h2>
    <ul>
      <li>
        <a href="./lit-ssr-demo">lit-ssr-demo</a>
      </li>
    </ul>

    ${sectionApi}

    <hr />
    <footer id="footer">
      <p>
        <code><a target="_blank" href="${appUrl}">${appName}</a> v${appVersion}</code>
      </p>
    </footer>
  `;
};
