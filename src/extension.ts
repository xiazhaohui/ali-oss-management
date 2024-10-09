import * as vscode from "vscode";
import { OssUploaderViewProvider } from "./components/OssUploaderView";
import { uploadFileToOSS } from "./utils/uploadFileToOss";
import { getWebviewImageContent } from "./components/getWebviewImageContent";
import { getWebviewVideoContent } from "./components/getWebviewVideoContent";
import { getWebviewAudioContent } from "./components/getWebviewAudioContent";
import { getWebviewJsonContent } from "./components/getWebviewJsonContent";
import axios from "axios";
import { createFolder } from "./utils/createFolder";

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  const treeList = new OssUploaderViewProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("view-id", treeList),

    // 预览图片/视频/音频
    vscode.commands.registerCommand(
      "webviewPanel.previewFile",
      (ossUrl, fileType) => {
        if (currentPanel) {
          currentPanel.dispose();
        }

        const previewWebviewOptions = {
          IMAGE: { title: "图片预览", webview: getWebviewImageContent },
          VIDEO: { title: "视频预览", webview: getWebviewVideoContent },
          AUDIO: { title: "音频预览", webview: getWebviewAudioContent },
        };
        // @ts-ignore
        const previewTitle = previewWebviewOptions[fileType].title;
        // @ts-ignore
        const previewWebview = previewWebviewOptions[fileType].webview;

        currentPanel = vscode.window.createWebviewPanel(
          "webviewId",
          previewTitle,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
          }
        );
        currentPanel.webview.html = previewWebview(ossUrl);
        currentPanel.onDidDispose(
          () => {
            currentPanel = undefined;
          },
          null,
          context.subscriptions
        );
      }
    ),

    // 预览JSON
    vscode.commands.registerCommand("webviewPanel.showJson", async (ossUrl) => {
      if (currentPanel) {
        currentPanel.dispose();
      }

      currentPanel = vscode.window.createWebviewPanel(
        "webviewId",
        "JSON预览",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      const jsonData = await axios.get(ossUrl);
      const jsonContent = JSON.stringify(jsonData.data, null, 2);

      currentPanel.webview.html = getWebviewJsonContent(ossUrl, jsonContent);
      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        null,
        context.subscriptions
      );
    }),

    // 上传文件
    vscode.commands.registerCommand("uploader.uploadFile", async () => {
      const data = await context.globalState.get("globalData");
      uploadFileToOSS(data);
    }),

    // 创建文件夹
    vscode.commands.registerCommand("uploader.createFolder", async () => {
      const data = (await context.globalState.get("globalData")) as {
        currentFolder: string;
      };
      const inputValue = await vscode.window.showInputBox({
        placeHolder: "请输入文件夹名称",
      });
      const folderName = String(inputValue?.trim().replaceAll(" ", ""));
      if (!folderName || folderName.includes("/")) {
        vscode.window.showErrorMessage(
          "请填写有效的文件夹名称，名称中不能包含斜杠 '/'"
        );
        return;
      }
      createFolder(folderName, data?.currentFolder);
    }),

    // 展开文件夹
    vscode.commands.registerCommand("uploader.updateFolder", async (v) => {
      treeList.updateFolder(v);
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

    // 状态管理
    vscode.commands.registerCommand("extension.setData", (v) => {
      context.globalState.update("globalData", v);
    })
  );
}

export function deactivate() {}
