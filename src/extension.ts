import * as vscode from "vscode";
import { OssUploaderViewProvider } from "./OssUploaderView";
import { uploadFileToOSS } from "./uploadFileToOss";
import { getWebviewContent } from "./getWebviewContent";

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  const treeList = new OssUploaderViewProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("view-id", treeList),

    // 预览图片
    vscode.commands.registerCommand("webviewPanel.showImage", (imgUrl) => {
      if (currentPanel) {
        currentPanel.dispose();
      }

      currentPanel = vscode.window.createWebviewPanel(
        "webviewId",
        "webviewTitle-预览图片",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      currentPanel.webview.html = getWebviewContent(imgUrl);
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );

      // 插件向 webview 推送消息
      currentPanel.webview.postMessage({ command: "refactor" });
      // 插件接收 webview 消息
      currentPanel.webview.onDidReceiveMessage(
        (message) => {
          vscode.env.clipboard.writeText(imgUrl).then(() => {
            vscode.window.showInformationMessage("OSS 链接已复制");
          });
        },
        undefined,
        context.subscriptions
      );
    }),

    // 上传文件
    vscode.commands.registerCommand("uploader.uploadFile", async () => {
      uploadFileToOSS();
    }),

    // 更新OSS文件列表
    vscode.commands.registerCommand("uploader.refreshOss", async () => {
      vscode.window.showInformationMessage("资源已刷新");
      treeList.refresh();
    }),

    // 配置 OSS
    vscode.commands.registerCommand("uploader.configuration", async () => {
      vscode.window.showInformationMessage(
        "请导航至 Settings 配置界面，搜索 ali-oss-management 进行配置"
      );
      vscode.commands.executeCommand("workbench.action.openSettings");
    })
  );
}

export function deactivate() {}
