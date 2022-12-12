# Hello World (Wide) Web

Webserver that shows HTML with "Hello World" and some version information, along with a simple (JSON) API.
Main purpose is to test CI/CD workflows (builds, deployments, …) and tools (Docker, Kubernetes, …) and services.

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

```bash
IMG=hello-world-web
PORT=8080
docker build -t $IMG .
# or: docker buildx build --load -t $IMG .
docker run --rm -it -e 'TITLE=Hello Docker!' -e PORT -p $PORT:$PORT $IMG
```

## Run with `docker-compose`

```bash
export PORT=8080
cp .env-default .env
docker compose up --build
```

## API

A small API is served with some functions that are usefull to test and debug deployments.

### examples

```bash
curl 'http://localhost:8081/api/time'
# {"now":"2022-12-10T09:27:02.582Z"}

curl --json '{"hello":"world"}' 'http://localhost:8081/api/echo?delay=1000'
# {"echo":{"hello":"world"}}
```

### global query parameters

Global query parameters apply to any API method.

#### `delay`

Adding a `delay` parameter with a number will pause for the given number in miliseconds,
e.g. `?delay=1000` will pause for 1 second before the request is processed.

<!-- NOTE: copied / kept in sync with views/home/section-api.html -->

### methods

<!-- markdownlint-disable MD033 -- allow HTML-->
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
      <td><a href="/api/config">/api/config</a></td>
      <td>
        <small>config as shown above</code></small>
      </td>
    </tr>
    <tr>
      <td>time</td>
      <td>GET</td>
      <td><a href="/api/time">/api/time</a></td>
      <td>
        <small>current time, e.g. <code>{"now":"2001-01-01T01:01:01.001Z"}</code></small>
      </td>
    </tr>
  </tbody>
</table>

## Debugging

### default (HTTP) port

All examples assume that port `8080` will be configured, but this port is nowhere used as a default so any misconfiguration will be spotted.
A different default port is used for every way that it can be configured,
so its easy to see from the resolved value which configuration was applied.
This table also show the order of precendence (last wins, if applicable).

| config                | port |
| --------------------- | ---- |
| webserver             | 9999 |
| `.env`file            | 4444 |
| `Dockerfile`          | 7777 |
| `docker-compose.yaml` | 3333 |
| `PORT` env var        | 8080 |

### Healthcheck

* `GET https://localhost:${PORT}/?healthcheck`
* Node.js script: `bin/healthcheck.mjs`
* with `docker` and `docker-compose`, see

    ```sh
    container=hello-world-web-webserver-1
    docker inspect $container | jq '.[0].State.Health'
    ```

## Development

```bash
npm i
npm dev
```
