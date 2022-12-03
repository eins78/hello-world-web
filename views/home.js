module.exports = ({ title = "Title", jsonData = null }) =>
  `
  <h1>${title}</h1>
  <pre>${JSON.stringify(jsonData, 0, 2)}</pre>

`.trim();
