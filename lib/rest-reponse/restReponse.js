// @ts-check
const path = require("path");

function restReponse(req, res, key, data) {
  const textString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const formatExtension = path.extname(req.path);

  const textSender = () => res.send(textString);
  const jsonSender = () => res.json({ [key]: data });
  const defaultFormatter = () => {
    const formatsByExtension = { ".json": jsonSender, ".yaml": jsonSender, ".yml": jsonSender };
    const formatterFromExtension = formatsByExtension[formatExtension];
    if (formatterFromExtension) {
      formatterFromExtension();
    } else {
      textSender();
    }
  };

  const formatsByContentNegotiation = {
    text: defaultFormatter,
    html: textSender,
    json: jsonSender,
    default() {
      res.status(406).send("Not Acceptable");
    },
  };

  res.format(formatsByContentNegotiation);
}

exports.restReponse = restReponse;
