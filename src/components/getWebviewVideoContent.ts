export const getWebviewVideoContent = (url: string) => {
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
          .link {
            margin: 10px 0;
          }
          #url-dom {
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="link">
            <button id="post-dom">复制</button>
            <span>OSS 链接：</span>
            <span id="url-dom">${url}</span>
          </div>
          <video controls src="${url}" />
        </div>
      </body>

      <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener('message', (event) => {
          // console.log('webview 接收到插件发送的消息', event);
        })

        document.getElementById('post-dom').addEventListener('click', () => {
          vscode.postMessage('自定义消息内容');
        })
      </script>
    </html>
  `;
};
