function restReponse(res, key, data) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  res.format({
    text() {
      res.send(text);
    },
    html() {
      res.send(text);
    },
    json() {
      res.json({ [key]: data });
    },
    default() {
      res.status(406).send("Not Acceptable");
    },
  });
}
exports.restReponse = restReponse;
