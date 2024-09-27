import * as vscode from "vscode";
import { TAliOssConfig } from "./uploadFileToOss";

export const openBrowserUrl = (url: string) => {
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
};

export const getOssConfig = () => {
  const config = vscode.workspace.getConfiguration();
  const ossConfig = config.get("ali-oss-management") as TAliOssConfig;
  const { accessKeyId, accessKeySecret, endpoint, region, bucket } = ossConfig;
  const newOssConfig = {
    accessKeyId,
    accessKeySecret,
    endpoint,
    region,
    bucket,
  };

  return newOssConfig;
};
