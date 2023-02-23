// @ts-check
const path = require("path");

/**
 * Sends data in REST-style either as requested via HTTP content negotiation (Accept Header), or by add a file extension to the path (Rails-style).
 * Supported file extensions: `.json`, `.yaml`, `.yml` (all return JSON strings, which are also valid YAML).
 * Enable JSONP by adding param with the name of the callback `?jsonpcallback=mycb'`.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} key
 * @param {string | Object} data
 */
function restReponse(req, res, key, data) {
  const textString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const formatExtension = path.extname(req.path).slice(1);

  const textSender = () => res.send(textString);
  const jsonSender = () => res.jsonp({ [key]: data });
  const formatsByExtension = { json: jsonSender, yaml: jsonSender, yml: jsonSender };
  const defaultFormatter = () => {
    const formatterFromExtension = formatsByExtension[formatExtension];
    if (formatterFromExtension) {
      formatterFromExtension();
    } else {
      textSender();
    }
  };

  res.format({
    text: defaultFormatter,
    html: defaultFormatter,
    ...formatsByExtension,
    default() {
      res.status(406).send("Not Acceptable");
    },
  });
}

exports.restReponse = restReponse;
