// @ts-check
import { Router } from "express";
import htmlTemplate from "../views/html.js";
import homeTemplate from "../views/home.js";
import config from "../config.js";
import { getClientInfo } from "../lib/client-info/clientInfo.js";

const title = process.env.APP_TITLE ?? "Hello World!";
const router = Router();

/* GET home page. */
router.get("/", function (req, res) {
  const client = getClientInfo(req);
  const pageData = { title, config, client };
  res.send(
    htmlTemplate({
      htmlTitle: title,
      basePath: config.basePath,
      bodyContent: homeTemplate(pageData),
    })
  );
});

export default router;
