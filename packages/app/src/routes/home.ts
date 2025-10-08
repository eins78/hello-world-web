import { Router } from "express";
import config from "../config.ts";
import { getClientInfo } from "../support/client-info/clientInfo.ts";
import { renderViewToStream } from "../support/render-view/renderView.ts";
import { Home as HomeComponent } from "../views/Home.ts";
import { Html as HtmlComponent } from "../views/Html.ts";

const router: Router = Router();
const c = config.content;

/* GET home page. */
router.get("/", async function (req, res) {
  const client = getClientInfo(req);
  const pageData = { config, client };
  const view = renderViewToStream(HtmlComponent, {
    htmlTitle: `${c.appTitle} | ${c.appName} v${c.appVersion}`,
    basePath: config.basePath,
    bodyContent: HomeComponent(pageData),
  });

  view.pipe(res);
});

export default router;
