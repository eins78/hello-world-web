module.exports = ({ htmlTitle = "Title", bodyContent = "" }) =>
  `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${htmlTitle}</title>
    <link rel="stylesheet" href="/stylesheets/style.css" />
  </head>
  <body>${bodyContent}</body>
  </html>

`.trim();
