# lit-ssr-demo

A demo of [server-side rendering with `lit`](https://lit.dev/docs/ssr/overview/).

The frontend components are built in this package,
written in [Typescript](https://www.typescriptlang.org/) and transformed to browser-compatible ES modules using [Rollup](https://rollupjs.org/).

The components are also bundled for node.js and imported into the server for the rendering,
which can be seen in the [server view](../views/LitSsrDemo.js).

The server-side rendered HTML is then sent to the browser, where the frontend components are "hydrated" and made interactive.
This can be seen by clicking the "Increment" button, which will increase the number displayed by 1.

The initial state of the counter is set to the [unix timestamp](https://en.wikipedia.org/wiki/Unix_time) (in seconds) of the server-side rendering,
this data is passed from the server to the client in the HTML markup, using the `initial-count` attribute on the `<epoch-counter>` element.
