import * as vscode from "vscode";
import path from "path";
import OSS from "ali-oss";
import { createReadStream } from "fs";

export type TAliOssConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  region: string;
  bucket: string;
  folder?: string;
};

export const uploadFileToOSS = async (state: any) => {
  const config = vscode.workspace.getConfiguration();
  const ossConfig = config.get("ali-oss-management") as TAliOssConfig;
  const { accessKeyId, accessKeySecret, endpoint, region, bucket, folder } =
    ossConfig;
  const newOssConfig = {
    accessKeyId,
    accessKeySecret,
    endpoint,
    region,
    bucket,
  };
  const hasCompleteConfig = Object.values(newOssConfig as any).every(
    (item) => !!item
  );
  console.log("OSS 配置", ossConfig, state);

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
      const isImage = ["PNG", "JPG", "JPEG", "GIF"].includes(
        ossUrl.slice(ossUrl.lastIndexOf(".") + 1)?.toUpperCase()
      );

      if (isImage) {
        vscode.commands.executeCommand("webviewPanel.showImage", ossUrl);
      }
      vscode.commands.executeCommand("uploader.refreshOss");
      vscode.env.clipboard.writeText(ossUrl).then(() => {
        vscode.window.showInformationMessage("OSS 链接已复制");
      });
    })
    .catch(() => {
      vscode.window.showErrorMessage(
        "上传失败，请检查 OSS 配置后和网络环境后重试"
      );
    });
};
