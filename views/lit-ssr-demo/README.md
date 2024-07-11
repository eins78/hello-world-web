# lit-ssr-demo

A demo of [server-side rendering with `lit`](https://lit.dev/docs/ssr/overview/).

The frontend components are built in this package,
written in [Typescript](https://www.typescriptlang.org/) and transformed to browser-compatible ES modules using [Rollup](https://rollupjs.org/).

The components are also bundled for node.js and imported into the server for the rendering,
which can be seen in the [server view](../views/LitSsrDemo.js).

The server-side rendered HTML is then sent to the browser, where the frontend components are "hydrated" and made interactive.
This can be seen by clicking the "Increment" button, which will increase the number displayed by 1.
