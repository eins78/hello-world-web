import { Router } from "express";
import config from "../config.ts";
import { renderViewToStream } from "../support/render-view/renderView.ts";
import { LitSsrDemo as LitSsrDemoComponent } from "../views/LitSsrDemo.ts";

const router: Router = Router();

router.get("/lit-ssr-demo", async function (req, res) {
  const view = renderViewToStream(LitSsrDemoComponent, {
    basePath: config.basePath,
    hello: "world",
    scriptInjectionTest: "</script><script>alert('hello script injection!')</script>",
  });

  // declare the content type so compression and clients can recognise the HTML stream
  res.type("html");
  view.pipe(res);
});

export default router;
