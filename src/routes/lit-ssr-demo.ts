import { Router } from "express";
import config from "../config.js";
import { renderViewToStream } from "../support/render-view/renderView.js";
import { LitSsrDemo as LitSsrDemoComponent } from "../views/LitSsrDemo.js";

const router: Router = Router();

router.get("/lit-ssr-demo", async function (req, res) {
  const view = renderViewToStream(LitSsrDemoComponent, {
    basePath: config.basePath,
    hello: "world",
    scriptInjectionTest: "</script><script>alert('hello script injection!')</script>",
  });

  view.pipe(res);
});

export default router;
