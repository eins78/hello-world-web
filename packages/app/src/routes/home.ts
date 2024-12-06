import { Router } from "express";
import config from "../config.ts";
import { getClientInfo } from "../support/client-info/clientInfo.ts";
import { renderViewToStream } from "../support/render-view/renderView.ts";
import { Home as HomeComponent } from "../views/Home.ts";
import { Html as HtmlComponent } from "../views/Html.ts";

const title = process.env.APP_TITLE ?? "Hello World!";
const router: Router = Router();

/* GET home page. */
router.get("/", async function (req, res) {
  const client = getClientInfo(req);
  const pageData = { title, config, client };
  const view = renderViewToStream(HtmlComponent, {
    htmlTitle: title,
    basePath: config.basePath,
    bodyContent: HomeComponent(pageData),
  });

  view.pipe(res);
});

export default router;
