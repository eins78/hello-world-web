# Performance Optimization

What the app does for production performance, what it measurably buys, and how to check it.
Originally scoped by [issue #305](https://github.com/eins78/hello-world-web/issues/305); only the
parts that could be measured were kept (see [Deliberately not done](#deliberately-not-done)).

## What is enabled

### gzip compression (runtime)

`packages/app/src/app.ts` registers the [`compression`](https://www.npmjs.com/package/compression)
middleware first. The production deployment runs behind Google Cloud Run, whose frontend does **not**
compress responses, so without this middleware every HTML page and stylesheet is sent uncompressed.

The middleware only compresses responses whose `Content-Type` is compressible, so the server-rendered
routes (`routes/home.ts`, `routes/lit-ssr-demo.ts`) set `res.type("html")` before streaming. Bodies
under the default threshold of 1 KB are left alone.

### Minified client bundle (build)

`packages/lit-ssr-demo/rollup.config.js` adds `@rollup/plugin-terser` to the **client** bundle when
`NODE_ENV=production`. The `Dockerfile` builds with `NODE_ENV=production`, so the published image ships
the minified bundle. Local `pnpm run build` and the GitHub `test`/`e2e` jobs build without it; only the
`docker-e2e` job exercises the minified output. The server bundle is not minified: it runs in Node and
is never transferred.

## Measured effect

Local measurements on 2026-10-10 against the production server (`NODE_ENV=production`), using
`curl` with and without `Accept-Encoding: gzip`. Before the change the live site sent the "plain"
sizes for every request.

| Response | plain | gzip | saving |
|---|---:|---:|---:|
| `/` (home page) | 3,400 B | 1,102 B | 68 % |
| `/lit-ssr-demo/` | 12,237 B | 2,761 B | 77 % |
| `/stylesheets/style.css` | 1,705 B | 721 B | 58 % |
| `/lit-ssr-demo/entry-client-*.js` (main chunk, minified) | 28,123 B | 9,892 B | 65 % |
| `/favicon.svg` (634 B, under threshold) | 634 B | 634 B | 0 % |
| `/api/time` (26 B, under threshold) | 26 B | 26 B | 0 % |

Client bundle (`packages/lit-ssr-demo/lib/client/*.js`, all files summed), dev build vs
`NODE_ENV=production` build:

| Build | raw | gzipped | build time |
|---|---:|---:|---:|
| dev (no terser) | 35,240 B | 11,814 B | 1.4 s |
| production (terser) | 30,082 B | 10,330 B | 1.2 s |
| saving | 15 % | 13 % | none |

Minification is cheap here but also small in effect: Lit ships pre-optimized code and the bundle is
already tiny. gzip is the change that matters.

## How to verify

```bash
# compression and content type (server must run in production mode; `pnpm start` sets NODE_ENV)
PORT=8080 pnpm start &
curl -s -o /dev/null -w '%{size_download}\n' http://localhost:8080/
curl -s -o /dev/null -w '%{size_download}\n' -H 'Accept-Encoding: gzip' http://localhost:8080/
curl -s -D - -o /dev/null -H 'Accept-Encoding: gzip' http://localhost:8080/lit-ssr-demo/ | grep -iE 'content-(type|encoding)'

# bundle size, dev vs production
pnpm --filter @hello-world-web/lit-ssr-demo run build && cat packages/lit-ssr-demo/lib/client/*.js | wc -c
NODE_ENV=production pnpm --filter @hello-world-web/lit-ssr-demo run build && cat packages/lit-ssr-demo/lib/client/*.js | wc -c
```

The `docker-e2e` GitHub workflow runs the same checks against the built image: HTML pages and the
stylesheet must arrive with `Content-Encoding: gzip`, and the served client entry must be minified.

## Deliberately not done

- **Long-lived `Cache-Control` headers (`max-age=1y, immutable`).** The static files are not
  content-hashed (`stylesheets/style.css`, `favicon.*`, and the Rollup entry `entry-client.js` keep
  fixed names), so returning browsers would keep stale CSS and a stale entry pointing at chunk hashes
  that no longer exist after a deploy. `express.static` already sends `ETag` and `Last-Modified`, so
  revalidation is a cheap 304. Long caching needs hashed filenames first; Rollup's lazy chunks are
  already hashed, so a `setHeaders` rule limited to `*-[hash].js` would be the safe first step.
- **Global 404 and error-handling middleware.** Express 5 already logs errors to stderr in production
  and hides stack traces from the response. The proposed handler logged only outside production and
  turned every missing page into JSON, so it was dropped. Only unknown `/api/*` paths answer with a
  JSON 404; missing pages keep Express's HTML 404.
- **Minifying the server bundle.** No transfer saving, worse stack traces.
- **`pnpm install --offline` in the Dockerfile.** It broke the Docker build in CI; the FIXME stays
  until the cause is understood.
- Framework swaps, cluster mode, CDNs, and the other "levelup" items from #305 are out of scope for
  this app's size.

## Related

- [Development Guidelines](./development-guidelines.md)
- [Cloud Run Deployment](./cloud-run-deployment.md)
- [e18e](https://e18e.dev/) for the cleanup / speedup / levelup framing used in #305
