import * as vscode from "vscode";
import OSS from "ali-oss";
import { getOssConfig } from "./vscode";

/**
 * @description: 新建文件夹
 * @param {string} folderName 文件夹名称
 * @param {string} currentFolder 当前文件夹名称
 * @return {*}
 */
export const createFolder = async (
  folderName: string,
  currentFolder: string
) => {
  const newOssConfig = getOssConfig();
  const hasCompleteConfig = Object.values(newOssConfig as any).every(
    (item) => !!item
  );
  const remotePath = `/${currentFolder || ""}${folderName}/`;
  if (!hasCompleteConfig) {
    vscode.window.showErrorMessage(
      "OSS 配置信息不完整，请先填写正确的 accessKeyId、accessKeySecret、bucket、endpoint 等数据"
    );
    return;
  }

  const client = new OSS(newOssConfig);
  client
    .put(remotePath, Buffer.from(""), { timeout: 10 * 60 * 1000 })
    .then((res) => {
      vscode.commands.executeCommand("uploader.refreshOss");
    })
    .catch(() => {
      vscode.window.showErrorMessage(
        "创建失败，请检查 OSS 配置后和网络环境后重试"
      );
    });
};
