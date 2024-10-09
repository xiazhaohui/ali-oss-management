export const getWebviewJsonContent = (url: string, jsonContent: string) => {
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
          pre {
            background-color: #f0f0f0;
            color: #333;
            padding: 10px;
            border-radius: 4px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <pre>${jsonContent}</pre>
        </div>
      </body>
    </html>
  `;
};
