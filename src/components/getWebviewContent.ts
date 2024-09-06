export const getWebviewContent = (url: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cat Coding</title>
        <style>
          .link {
            margin-top: 10px;
          }
          #url-dom {
            word-break: break-all;
          }
          .operation {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <img src="${url}" />
        <div>
          <div class="link">
            <span>OSS 链接：</span>
            <span id="url-dom">${url}</span>
          </div>
          <div class="operation">
            <button id="post-dom">复制</button>
          </div>
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
