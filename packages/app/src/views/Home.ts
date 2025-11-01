import { html } from "@lit-labs/ssr";
import { SectionApi } from "./home/SectionApi.ts";
import type { ClientInfo } from "../support/client-info/clientInfo.ts";
import type { Config } from "../config.ts";

export type HomeProps = {
  config: Config;
  client: ClientInfo;
};

export const Home = ({ config, client }: HomeProps) => {
  // Extract content for easier destructuring
  const content = config.content;
  const {
    appTitle,
    appDescription,
    appUrl,
    appName,
    appVersion,
    ciRunUrl,
    ciRunNumber,
    ciCommitSha,
    ciCommitShortSha,
    ciDockerImage,
    garProjectId,
    garLocation,
    garRepository,
    garImageName,
  } = content;

  const clientInfo = { ...client, headers: undefined, trailers: undefined };
  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };
  const sectionApi = SectionApi({ basePath: config.basePath });

  // Format CI metadata for display
  const commitUrl = ciCommitSha ? `${appUrl}/commit/${ciCommitSha}` : undefined;

  // Construct Google Artifact Registry URL
  const garImageUrl =
    ciDockerImage && garProjectId && garLocation && garRepository && garImageName
      ? `https://console.cloud.google.com/artifacts/docker/${garProjectId}/${garLocation}/${garRepository}/${garImageName}/${ciDockerImage}?project=${garProjectId}`
      : undefined;

  // Footer components for readability
  const appVersionInfo = html`<code><a target="_blank" href="${appUrl}">${appName}</a> v${appVersion}</code>`;

  const commitInfo = commitUrl ? html`commit <a target="_blank" href="${commitUrl}">${ciCommitShortSha}</a>` : "";

  const ciDeploymentInfo = ciRunUrl
    ? html` deployed by <a target="_blank" href="${ciRunUrl}">CI run${ciRunNumber ? ` #${ciRunNumber}` : ""}</a>`
    : "";

  const dockerImageInfo = garImageUrl ? html` using <a target="_blank" href="${garImageUrl}">docker image</a>` : "";

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
      ${appVersionInfo}
      <small>${commitInfo}${ciDeploymentInfo}${dockerImageInfo}</small>
    </footer>
  `;
};
