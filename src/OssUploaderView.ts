import * as vscode from "vscode";
import {
  ProviderResult,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import { TAliOssConfig } from "./uploadFileToOss";
import OSS from "ali-oss";

export class OssUploaderViewProvider
  implements vscode.TreeDataProvider<FileItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | void
  > = new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private files: FileItem[] = [];

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): TreeItem {
    console.log("getTreeItem", element);
    const treeItem = new TreeItem(
      element.fileName,
      TreeItemCollapsibleState.None
    );
    treeItem.iconPath = new ThemeIcon("circle-filled");
    const isImage = ["PNG", "JPG", "JPEG", "GIF"].includes(
      element.fileName
        .slice(element.fileName.lastIndexOf(".") + 1)
        ?.toUpperCase()
    );
    if (isImage) {
      treeItem.command = {
        command: "webviewPanel.showImage",
        title: "预览",
        arguments: [element.filePath],
      };
    }

    return treeItem;
  }

  getChildren(element?: FileItem): ProviderResult<FileItem[]> {
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
    if (!hasCompleteConfig) {
      vscode.window.showErrorMessage(
        "OSS 配置信息不完整，请先填写正确的 accessKeyId、accessKeySecret、bucket、endpoint 等数据"
      );
      return Promise.resolve([]);
    }

    const client = new OSS(newOssConfig);

    console.log("getChildren", element, ossConfig);

    if (!element) {
      return Promise.resolve(
        client
          .list(
            {
              prefix: folder,
              "max-keys": 1000,
            },
            {}
          )
          .then((res) => {
            this.files = res.objects.map(
              (item) =>
                ({
                  fileName: `${item.name.split(folder as string)[1]}`,
                  filePath: item.url,
                } as FileItem)
            );
            console.log("OSS 列表", res, this.files);
            if (this.files.length === 0) {
              vscode.window.showInformationMessage("暂无资源");
            }
            return Promise.resolve(this.files);
          })
          .catch((error) => {
            console.log(" OSS 列表错误", error);
            return Promise.resolve([]);
          })
      );
    } else {
      return Promise.resolve([]);
    }
  }

  addFile(file: FileItem): void {
    this.files.push(file);
    this.refresh();
  }

  removeFile(file: FileItem): void {
    this.files = this.files.filter((f) => f !== file);
    this.refresh();
  }
}

export class FileItem extends vscode.TreeItem {
  public tooltip: string;
  public contextValue = "fileItem";

  constructor(
    public readonly fileName: string,
    public readonly filePath: string,
    public readonly command?: vscode.Command
  ) {
    super(fileName);

    // 现在初始化 tooltip 属性
    this.tooltip = `${this.fileName} - ${this.filePath}`;
  }
}
