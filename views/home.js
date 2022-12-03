const [fs, path] = [require("fs"), require("path")];
const apiDocs = fs.readFileSync(path.join(__dirname, "./home/section-api.html"));

module.exports = ({ title = "Title", jsonData = null }) =>
  `
  <h1>${title}</h1>

  <h2>config</h2>
  <pre>${JSON.stringify(jsonData, 0, 2)}</pre>

  ${apiDocs}

`.trim();
