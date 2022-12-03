# Hello World Web

Webserver that shows HTML with "Hello World" and some version information.

* mainly to test CI/CD things (builds, deployments, …)
* no build step
* relatively small footprint (less than 2MB in prod)
* large dev-dependency (prettier, 14MB), usefull to check build sizes dev vs prod
* CSS styles as static assets, to check proper routing/serving.

Run, then open <http://localhost:3000> or `open http://localhost:$PORT`.

## Run with nodejs

```bash
npm ci --prod
npm start
```

## Development

```bash
npm i
npm dev
```
