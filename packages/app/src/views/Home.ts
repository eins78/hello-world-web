import { html } from "@lit-labs/ssr";
import { SectionApi } from "./home/SectionApi.ts";
import { getClientInfo } from "../support/client-info/clientInfo.ts";

export type HomeProps = {
  title: string;
  config: Record<string, string>;
  client: ReturnType<typeof getClientInfo>;
};

export const Home = ({ title = "Title", config, client }: HomeProps) => {
  const clientInfo = { ...client, headers: undefined, trailers: undefined };
  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };
  const sectionApi = SectionApi({ basePath: config.basePath });

  return html`
    <h1>${title}</h1>

    <h2>Connection Information</h2>

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

    <h2>HTML Demos</h2>
    <ul>
      <li>
        <a href="./lit-ssr-demo">lit-ssr-demo</a>
      </li>
      <li><a href="./demos/ical">iCalendar Demo</a> - Generate dynamic iCal feeds</li>
    </ul>

    ${sectionApi}
  `;
};
