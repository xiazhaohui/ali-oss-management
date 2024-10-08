import * as vscode from "vscode";
import path from "path";
import OSS from "ali-oss";
import { createReadStream } from "fs";
import { getOssConfig } from "./vscode";
import {
  AVAILABLE_FILE_TYLE_IMAGE,
  AVAILABLE_FILE_TYPE_AUDIO,
  AVAILABLE_FILE_TYPE_VIDEO,
} from "./constants";

export type TAliOssConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  region: string;
  bucket: string;
  folder?: string;
};

export const uploadFileToOSS = async (state: any) => {
  const newOssConfig = getOssConfig();
  const hasCompleteConfig = Object.values(newOssConfig as any).every(
    (item) => !!item
  );
  console.log("OSS 配置", state);

  if (!hasCompleteConfig) {
    vscode.window.showErrorMessage(
      "OSS 配置信息不完整，请先填写正确的 accessKeyId、accessKeySecret、bucket、endpoint 等数据"
    );
    return;
  }

  // 显示文件选择对话框
  const uri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: "选择文件",
    filters: {
      Images: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "mp4",
        "mov",
        "avi",
        "mp3",
        "wav",
        "aac",
        "m4a",
        "json",
        "txt",
        "xlsx",
        "xls",
        "zip",
        "rar",
      ],
    },
  });

  if (!uri?.length) {
    return; // 如果没有选择文件，则直接返回
  }
  const [selectedFile] = uri;
  const filePath = vscode.workspace.asRelativePath(selectedFile.fsPath);
  const name = path.basename(filePath);

  // 上传到当前目录 获取目录变量
  const remotePath = `/${state?.currentFolder || ""}${name}`;
  const fileStream = createReadStream(filePath);
  console.log("选择的文件流", remotePath, fileStream);

  const client = new OSS(newOssConfig);
  client
    // @ts-ignore
    .putStream(remotePath, fileStream, { timeout: 10 * 60 * 1000 })
    .then((res) => {
      // @ts-ignore
      const ossUrl = res?.url || "";
      const suffix = ossUrl.slice(ossUrl.lastIndexOf(".") + 1)?.toUpperCase();
      const isImage = AVAILABLE_FILE_TYLE_IMAGE.includes(suffix);
      const isVideo = AVAILABLE_FILE_TYPE_VIDEO.includes(suffix);
      const isAudio = AVAILABLE_FILE_TYPE_AUDIO.includes(suffix);

      if (isImage || isVideo || isAudio) {
        vscode.commands.executeCommand(
          "webviewPanel.previewFile",
          ossUrl,
          isImage ? "IMAGE" : isVideo ? "VIDEO" : "AUDIO"
        );
      }

      vscode.commands.executeCommand("uploader.refreshOss");
    })
    .catch(() => {
      vscode.window.showErrorMessage(
        "上传失败，请检查 OSS 配置后和网络环境后重试"
      );
    });
};
