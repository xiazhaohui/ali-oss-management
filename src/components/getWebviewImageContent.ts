export const getWebviewImageContent = (url: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cat Coding</title>
        <style>
          .container {
            display: flex;
            flex-direction: column;
            overflow: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${url}" />
        </div>
      </body>
    </html>
  `;
};
