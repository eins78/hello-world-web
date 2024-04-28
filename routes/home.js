// @ts-check
import { Router } from "express";
import homeTemplate from "../views/home.js";
import config from "../config.js";
import { getClientInfo } from "../lib/client-info/clientInfo.js";
import { renderViewToStream } from "../lib/render-view/renderView.js";

const title = process.env.APP_TITLE ?? "Hello World!";
const router = Router();

import { Html } from "../views/components/Html.js";

/* GET home page. */
router.get("/", function (req, res) {
  const client = getClientInfo(req);
  const pageData = { title, config, client };
  const view = renderViewToStream(Html, {
    htmlTitle: title,
    basePath: config.basePath,
    bodyContent: homeTemplate(pageData),
  });

  view.pipe(res);
});

export default router;
