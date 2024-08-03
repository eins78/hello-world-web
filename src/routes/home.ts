// @ts-check
import { Router } from "express";
import config from "../config.js";
import { getClientInfo } from "../support/client-info/clientInfo.js";
import { renderViewToStream } from "../support/render-view/renderView.js";
import { Home as HomeComponent } from "../views/Home.js";
import { Html as HtmlComponent } from "../views/Html.js";

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
