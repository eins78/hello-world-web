# Hello World (Wide) Web

Small toy web server with a few features to test and debug several HTTP- and web-related festures. Main purpose is to test CI/CD workflows (builds, deployments, …) and tools (Docker, Kubernetes, …) and services.

* no build step
* relatively small footprint (less than 2MB in prod)
* larger dev-dependencies (typescript, eslint, prettier, >100MB), usefull to compare build sizes of dev vs prod
* CSS styles as static assets, to check proper routing/serving.

Run, then open <http://localhost:8080> or `open http://localhost:$PORT`.

## Features

### Quick Setup
* **No configuration needed** - Works with sensible defaults
* **Small footprint** - Less than 2MB in production
* **Multiple deployment methods** - Run with npm, Docker, systemd, or cloud buildpacks
* **Direct execution** - Run with `npx hello-world-web` without installation

### HTTP APIs
* **Server configuration** (`/api/config`) - Returns version, startup time, and configuration
* **Time endpoint** (`/api/time`) - Provides current server timestamp
* **Client information** (`/api/client`) - Shows request details including headers, IP, and browser info
* **Content negotiation** - Supports JSON, HTML, and plain text responses

### Web Components Demo
* **Counter component** - Interactive counter demonstrating server-side rendering with client-side hydration using [lit SSR](https://lit.dev/docs/ssr/overview/)
* **Epoch counter** - Shows server render time with client-side hydration

### Health Monitoring
* **Health check endpoint** - Available at `/api/time?healthcheck`
* **Docker health checks** - Built-in support for Docker and Docker Compose
* **Monitoring script** - Standalone health check script for external monitoring

### Configuration
* **Environment variables** - Configure PORT, APP_TITLE, APP_DESCRIPTION, and BASE_PATH
* **Port configuration** - Supports multiple configuration sources (.env, Docker, environment)
* **Base path support** - Deploy under subdirectories with BASE_PATH setting

## Debugging

### default (HTTP) port

All examples assume that port `8080` will be configured, but this port is nowhere used as a default so any misconfiguration will be spotted.
A different default port is used for every way that it can be configured,
so its easy to see from the resolved value which configuration was applied.
This table also shows the order of precendence (last wins, if applicable).

| config                | port |
| --------------------- | ---- |
| webserver             | 9999 |
| `.env`file            | 4444 |
| `Dockerfile`          | 7777 |
| `docker-compose.yaml` | 3333 |
| `PORT` env var        | 8080 |

### Healthcheck

There is a healthcheck script that checks if the homepage is served with a non-error status.
Note that the query parameter `?healthcheck` is used, but not handled specifically by the server,
it just helps to identifiy the healthcheck requests in logs.

* `GET https://localhost:${PORT}/api/time?healthcheck`
* Node.js script: `bin/healthcheck.mjs`
* with `docker` and `docker-compose`, see

    ```sh
    ctr=hello-world-web-webserver-1
    docker inspect $ctr | jq '.[0].State.Health'
    ```

## Running on different platforms

`hello-world-web` can be run on a variety of platforms, using different runtimes and tools.

### Run with Node.js

Install [node.js](https://nodejs.org/en/download).
Needs NODE v22.7.0 or later for experimental native support of TypeScript.

#### Run from source with Node.js

Clone this repository and run the app:

```bash
export PORT=8080
npm ci --prod
npm start
```

### Run from source with Node.js using `npx`

Clone this repository and run the app:

```bash
export PORT=8080
pnpm run build
npx .
```

### Run from published package with Node.js using `npx`

```bash
export PORT=8080
npx hello-world-web
```

### Run from latest code on github using `npx`

```bash
export PORT=8080
npx https://github.com/eins78/hello-world-web
```

### Run with `docker`

Use a prebuilt image, or build one locally with Docker either directly or using buildpacks.

#### use a prebuilt image hosted on the Github Container registry

```bash
IMG=ghcr.io/eins78/hello-world-web:main
docker pull $IMG
```

#### build locally and run

```bash
IMG=hello-world-web
docker buildx build --load -t $IMG .
# or with a different base image:
docker buildx build --build-arg BASEIMAGE=node:slim --load -t $IMG .
```

#### build with `buildpacks`

Builds in a docker "builder" Docker container and outputs a "runner" Docker image.

* see [`buildpacks.io`](https://buildpacks.io)
* images published (manually) on dockerhub: <https://hub.docker.com/r/eins78/hello-world-web-buildpacks>

```bash
brew install buildpacks/tap/pack

app_version="$(node -p 'require("./package.json").version')"
IMG="eins78/hello-world-web-buildpacks:${app_version}.0"
PACK_BUILDER="paketobuildpacks/builder:base"

pack build "$IMG" --builder "$PACK_BUILDER"
# to publish: docker push "$IMG"
```

#### run the image

```bash
export PORT=8080
export "APP_TITLE=Hello ${USER}@$(hostname -s)"!
docker run --rm -it -e APP_TITLE -e PORT -p $PORT:$PORT $IMG
```

### Run with `docker-compose`

```bash
export PORT=8080
cp .env-default .env
docker compose up --build
```

### Run with `systemd` and `Docker`

install systemd config and service:

```bash
curl -fsSL https://raw.githubusercontent.com/eins78/hello-world-web/main/deploy/systemd/hello-world-web.conf | sudo tee /etc/hello-world-web.conf
curl -fsSL https://raw.githubusercontent.com/eins78/hello-world-web/main/deploy/systemd/hello-world-web-docker.service | sudo tee /etc/systemd/system/hello-world-web.service
sudo systemctl daemon-reload
sudo systemctl enable hello-world-web
sudo systemctl restart hello-world-web
sudo systemctl status hello-world-web
sudo journalctl -efu hello-world-web 
```

### Run with `systemd` and `node.js`

Install [node.js](https://nodejs.org/en/download), see [nodesource/distributions](https://github.com/nodesource/distributions?tab=readme-ov-file#installation-instructions).
Debian/Ubuntu example:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && \
sudo apt-get install -y nodejs
```

install app code, config and systemd service:

```bash
sudo git clone https://github.com/eins78/hello-world-web.git /opt/hello-world-web
sudo cp /opt/hello-world-web/deploy/systemd/hello-world-web.conf /etc/hello-world-web.conf
sudo cp /opt/hello-world-web/deploy/systemd/hello-world-web.service /etc/systemd/system/hello-world-web.service
sudo mkdir -p /var/www/
sudo chown -R www-data /var/www /opt/hello-world-web /etc/hello-world-web.conf
sudo systemctl daemon-reload
sudo systemctl enable hello-world-web
sudo systemctl restart hello-world-web
sudo systemctl status hello-world-web
sudo journalctl -efu hello-world-web 
```

## Development

```bash
pnpm i
pnpm dev
```

### direnv

See <https://direnv.net/#basic-installation>.

```sh
brew install direnv || apt install direnv
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

direnv allow .
```

### Typescript in Javascript files

See <https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html>.

### Running Typescript natively in Node.js

* <https://nodejs.org/en/learn/typescript/run-natively#running-typescript-natively>
* <https://nodejs.org/docs/latest/api/typescript.html#typescript-features>

### running tests

the following commands will run all tests like in CI (Github Actions), but locally:

```bash
pnpm run ci
```

To test GitHub Actions workflows locally using `act`, see [Testing Workflows Locally](docs/testing-github-workflows-locally.md).

### E2E (End-to-End) tests

* [Playwright](https://playwright.dev/) with [playwright-bdd](https://github.com/vitalets/playwright-bdd)
* BDD approach using Gherkin syntax
* See [packages/e2e-tests/README.md](packages/e2e-tests/README.md) for details
* [Gherkin writing guidelines](packages/e2e-tests/GHERKIN_RULES.md)

### renovate bot

The Renovate bot is configured to update dependencies and create PRs.
Non-Major updates are automatically merged after the CI checks pass.
When updating the renovate config (`renovate.json5`), the branch should be prefixed with `renovate/` so that the bot will validate the changes when a PR is created.

* Docs: <https://docs.renovatebot.com/configuration-options/>
* [Dependency Dashboard](https://github.com/eins78/hello-world-web/issues/46)
