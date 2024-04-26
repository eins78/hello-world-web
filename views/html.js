// @ts-check
module.exports = ({ htmlTitle = "Title", bodyContent = "", basePath = "/" }) =>
  `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${htmlTitle}</title>
    <link rel="stylesheet" href="${basePath}stylesheets/style.css" />
    <link rel="icon" type="image/svg+xml" href="${basePath}favicon.svg">
    <link rel="icon" type="image/png" href="${basePath}favicon.png">
  </head>
  <body>${bodyContent}</body>
  </html>

`.trim();
