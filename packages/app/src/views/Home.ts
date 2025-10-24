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
    ciCommitTimestamp,
    ciDockerImage,
  } = content;

  const clientInfo = { ...client, headers: undefined, trailers: undefined };
  const headersAndTrailers = { headers: client["headers"], trailers: client["trailers"] };
  const sectionApi = SectionApi({ basePath: config.basePath });

  // Format CI metadata for display
  const commitUrl = ciCommitSha ? `${appUrl}/commit/${ciCommitSha}` : undefined;
  const commitDate = ciCommitTimestamp
    ? new Date(ciCommitTimestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : undefined;
  // Extract org/repo from GitHub URL, removing any .git suffix or trailing slash
  const repoMatch = appUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  const repoName = repoMatch ? repoMatch[1].replace(/(\.git)?\/?$/, "") : undefined;
  if (ciDockerImage && !repoMatch) {
    // Could not extract repository info from appUrl; Docker Hub link will be missing.
    console.warn(`[Home] Could not extract repository info from appUrl (${appUrl}) for Docker Hub link.`);
  }
  const dockerHubUrl =
    ciDockerImage && repoName ? `https://hub.docker.com/r/${repoName}/tags?name=${ciDockerImage}` : undefined;

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
        <code><a target="_blank" href="${appUrl}">${appName}</a> v${appVersion}</code>${ciRunUrl
          ? html` <small
              >deployed by
              <a target="_blank" href="${ciRunUrl}">CI run${ciRunNumber ? ` #${ciRunNumber}` : ""}</a>${commitUrl
                ? html` from commit <a target="_blank" href="${commitUrl}">${ciCommitShortSha}</a>`
                : ""}${commitDate ? html` (${commitDate})` : ""}${dockerHubUrl
                ? html` using <a target="_blank" href="${dockerHubUrl}">image from docker hub</a>`
                : ""}</small
            >`
          : ""}
      </p>
    </footer>
  `;
};
