import * as vscode from "vscode";
import { OssUploaderViewProvider } from "./components/OssUploaderView";
import { uploadFileToOSS } from "./utils/uploadFileToOss";
import { getWebviewImageContent } from "./components/getWebviewImageContent";
import { getWebviewVideoContent } from "./components/getWebviewVideoContent";
import { getWebviewAudioContent } from "./components/getWebviewAudioContent";
import { getWebviewJsonContent } from "./components/getWebviewJsonContent";
import axios from "axios";

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  const treeList = new OssUploaderViewProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("view-id", treeList),

    vscode.commands.registerCommand("uploader.readFile", async () => {
      try {
        // 指定要读取的文件路径
        const filePath = vscode.Uri.file(
          `${
            vscode.workspace.rootPath ||
            // @ts-ignore
            vscode.workspace.workspaceFolders[0].uri.path
          }/.vscode/settings.json`
        );
        // 打开文件
        const document = await vscode.workspace.openTextDocument(filePath);
        // 读取文件内容
        const fileContent = document.getText();
        console.log("读文件", fileContent, JSON.parse(fileContent));
      } catch (error) {
        vscode.window.showErrorMessage(`Error reading file: ${error}`);
      }
    }),

    // 展开目录
    vscode.commands.registerCommand("uploader.updateFolder", async (v) => {
      treeList.updateFolder(v);
    }),

    // 预览图片
    vscode.commands.registerCommand("webviewPanel.showImage", (imgUrl) => {
      console.log("文件-图片预览", imgUrl);
      if (currentPanel) {
        currentPanel.dispose();
      }

      currentPanel = vscode.window.createWebviewPanel(
        "webviewId",
        "webviewTitle-图片预览",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      currentPanel.webview.html = getWebviewImageContent(imgUrl);
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

    // 预览视频
    vscode.commands.registerCommand("webviewPanel.showVideo", (videoUrl) => {
      console.log("文件-视频预览", videoUrl);
      if (currentPanel) {
        currentPanel.dispose();
      }

      currentPanel = vscode.window.createWebviewPanel(
        "webviewId",
        "webviewTitle-视频预览",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      currentPanel.webview.html = getWebviewVideoContent(videoUrl);
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
          vscode.env.clipboard.writeText(videoUrl).then(() => {
            vscode.window.showInformationMessage("OSS 链接已复制");
          });
        },
        undefined,
        context.subscriptions
      );
    }),

    // 预览音频
    vscode.commands.registerCommand("webviewPanel.showAudio", (ossUrl) => {
      console.log("文件-音频预览", ossUrl);
      if (currentPanel) {
        currentPanel.dispose();
      }

      currentPanel = vscode.window.createWebviewPanel(
        "webviewId",
        "webviewTitle-音频预览",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      currentPanel.webview.html = getWebviewAudioContent(ossUrl);
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
          vscode.env.clipboard.writeText(ossUrl).then(() => {
            vscode.window.showInformationMessage("OSS 链接已复制");
          });
        },
        undefined,
        context.subscriptions
      );
    }),

    // 预览JSON
    vscode.commands.registerCommand("webviewPanel.showJson", async (ossUrl) => {
      console.log("文件-JSON预览", ossUrl);
      if (currentPanel) {
        currentPanel.dispose();
      }

      currentPanel = vscode.window.createWebviewPanel(
        "webviewId",
        "webviewTitle-JSON预览",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      const jsonData = await axios.get(ossUrl);
      const jsonContent = JSON.stringify(jsonData.data, null, 2);
      console.log(" JSON内容", jsonData, jsonContent);

      currentPanel.webview.html = getWebviewJsonContent(ossUrl, jsonContent);
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
          vscode.env.clipboard.writeText(ossUrl).then(() => {
            vscode.window.showInformationMessage("OSS 链接已复制");
          });
        },
        undefined,
        context.subscriptions
      );
    }),

    // 上传文件
    vscode.commands.registerCommand("uploader.uploadFile", async () => {
      const data = await context.globalState.get("globalData");
      console.log("获取变量", data);
      uploadFileToOSS(data);
    }),

    // 更新 OSS 文件列表
    vscode.commands.registerCommand("uploader.refreshOss", async () => {
      vscode.window.showInformationMessage("资源已刷新");
      treeList.refresh();
    }),

    // 复制链接
    vscode.commands.registerCommand("uploader.copyLink", async (e) => {
      vscode.env.clipboard.writeText(e.url).then(() => {
        vscode.window.showInformationMessage("链接已复制");
      });
    }),

    // 配置 OSS
    vscode.commands.registerCommand("uploader.configuration", async () => {
      vscode.window.showInformationMessage(
        "请导航至 Settings 配置界面，搜索 ali-oss-management 进行配置"
      );
      vscode.commands.executeCommand("workbench.action.openSettings");
    }),

    vscode.commands.registerCommand("extension.setData", (v) => {
      context.globalState.update("globalData", v);
    })
  );
}

export function deactivate() {}
