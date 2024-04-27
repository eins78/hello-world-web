# Hello World (Wide) Web

Small toy web server with a few features to test and debug several HTTP- and web-related festures. Main purpose is to test CI/CD workflows (builds, deployments, …) and tools (Docker, Kubernetes, …) and services.

* no build step
* relatively small footprint (less than 2MB in prod)
* large dev-dependency (prettier, 14MB), usefull to compare build sizes of dev vs prod
* CSS styles as static assets, to check proper routing/serving.

Run, then open <http://localhost:8080> or `open http://localhost:$PORT`.

## Run with nodejs

```bash
npm ci --prod
npm start
```

## Run with `docker`

Use a prebuilt image, or build one locally with Docker either directly or using buildpacks.

### use a prebuilt image hosted on the Github Container registry

```bash
IMG=ghcr.io/eins78/hello-world-web:main
docker pull $IMG
```

### build locally and run

```bash
IMG=hello-world-web
docker buildx build --build-arg BASEIMAGE=$NODE_BASEIMAGE --load -t $IMG .
```

### build with `buildpacks`

Builds in a docker "builder" Docker container and outputs a "runner" Docker image.

* see [`buildpacks.io`](https://buildpacks.io)
* images published (manually) on dockerhub: <https://hub.docker.com/r/eins78/hello-world-web-buildpacks>

```bash
brew install buildpacks/tap/pack

source VERSION.env
IMG="eins78/hello-world-web-buildpacks:${VERSION}.0"
PACK_BUILDER="paketobuildpacks/builder:base"

pack build "$IMG" --builder "$PACK_BUILDER"
# to publish: docker push "$IMG"
```

### run the image

```bash
export PORT=8080
export "APP_TITLE=Hello ${USER}@$(hostname -s)"!
docker run --rm -it -e APP_TITLE -e PORT -p $PORT:$PORT $IMG
```

## Run with `docker-compose`

```bash
export PORT=8080
cp .env-default .env
docker compose up --build
```

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

* `GET https://localhost:${PORT}/?healthcheck`
* Node.js script: `bin/healthcheck.mjs`
* with `docker` and `docker-compose`, see

    ```sh
    ctr=hello-world-web-webserver-1
    docker inspect $ctr | jq '.[0].State.Health'
    ```

## Development

```bash
npm i
npm dev
```

### direnv

See <https://direnv.net/#basic-installation>.

```sh
brew install direnv || apt install direnv
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

direnv allow .
```
