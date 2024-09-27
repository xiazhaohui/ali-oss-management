import * as vscode from "vscode";
import {
  ProviderResult,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import OSS from "ali-oss";
import { TAliOssConfig } from "../utils/uploadFileToOss";
import {
  AVAILABLE_FILE_TYLE_IMAGE,
  AVAILABLE_FILE_TYPE_AUDIO,
  AVAILABLE_FILE_TYPE_VIDEO,
} from "../utils/constants";

export class OssUploaderViewProvider
  implements vscode.TreeDataProvider<FileItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | void
  > = new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private files: FileItem[] = [];
  private isInitialized: boolean = false;
  private filterFolder: string = "";

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): TreeItem {
    const treeItem = new TreeItem(element.name, TreeItemCollapsibleState.None);

    // 文件夹
    if (element.type === "folder") {
      // console.log("文件夹渲染", this.filterFolder, element);

      treeItem.label =
        element.name === this.filterFolder
          ? `../${element.name}`
          : element.name
              .replace(this.filterFolder as string, "")
              .replaceAll("/", "") || ">>> 未知目录 >>>";
      treeItem.iconPath = new ThemeIcon("folding-collapsed");

      const pathSection = element.name.split("/");
      const parentPathName = pathSection
        .slice(0, pathSection.length - 2)
        .join("/");
      const parentPath = parentPathName ? parentPathName + "/" : parentPathName;

      treeItem.command = {
        command: "uploader.updateFolder",
        title: "更新目录",
        arguments: [element.isParent ? parentPath : element.name],
      };
    }
    // 文件
    if (element.type === "file") {
      treeItem.contextValue = element.url;
      // 图片
      const suffix = element.name
        .slice(element.name.lastIndexOf(".") + 1)
        ?.toUpperCase();
      const isImage = AVAILABLE_FILE_TYLE_IMAGE.includes(suffix);
      const isVideo = AVAILABLE_FILE_TYPE_VIDEO.includes(suffix);
      const isAudio = AVAILABLE_FILE_TYPE_AUDIO.includes(suffix);
      const isJSON = ["JSON"].includes(suffix);
      if (isImage) {
        treeItem.command = {
          command: "webviewPanel.showImage",
          title: "预览",
          arguments: [element.url],
        };
      }
      if (isVideo) {
        treeItem.command = {
          command: "webviewPanel.showVideo",
          title: "预览",
          arguments: [element.url],
        };
      }
      if (isAudio) {
        treeItem.command = {
          command: "webviewPanel.showAudio",
          title: "预览",
          arguments: [element.url],
        };
      }
      if (isJSON) {
        treeItem.command = {
          command: "webviewPanel.showJson",
          title: "预览",
          arguments: [element.url],
        };
      }
    }
    // console.log("getTreeItem", element, treeItem);
    return treeItem;
  }

  getChildren(element?: FileItem): ProviderResult<FileItem[]> {
    const config = vscode.workspace.getConfiguration();
    const ossConfig = config.get("ali-oss-management") as TAliOssConfig;
    const { accessKeyId, accessKeySecret, endpoint, region, bucket } =
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

    console.log("getChildren", this.isInitialized, this.files);

    // 初始化加载
    if (!this.isInitialized) {
      vscode.commands.executeCommand("extension.setData", {
        currentFolder: "",
      });
      return Promise.resolve(
        client
          .list({ delimiter: "/", "max-keys": 1000 }, {})
          .then((res) => {
            let listData: any[] = [];
            res.prefixes?.forEach((folderItem) => {
              listData.push({
                type: "folder",
                isParent: false,
                name: folderItem,
                url: null,
              });
            });
            res.objects?.forEach((item) => {
              listData.push({
                type: "file",
                isParent: false,
                name: item.name,
                url: item.url.replaceAll("http://", "https://"),
              });
            });
            // @ts-ignore
            this.files = listData;
            console.log("初始化加载----OSS 列表", res, this.files);
            if (this.files.length === 0) {
              vscode.window.showInformationMessage("暂无资源");
            }
            return Promise.resolve(this.files);
          })
          .catch((error) => {
            console.log(" OSS 列表错误", error);
            return Promise.resolve([]);
          })
          .finally(() => {
            this.isInitialized = true;
          })
      );
    } else {
      // 加载指定目录下资源
      const prefixName = this.filterFolder;
      vscode.commands.executeCommand("extension.setData", {
        currentFolder: prefixName,
      });
      // 存储一个变量，供上传时调用
      return Promise.resolve(
        client
          .list(
            prefixName
              ? { prefix: prefixName, delimiter: "/", "max-keys": 1000 }
              : { delimiter: "/", "max-keys": 1000 },
            {}
          )
          .then((res) => {
            let listData: any[] = [];
            if (prefixName) {
              listData.push({
                type: "folder",
                isParent: true,
                name: prefixName,
                url: null,
              });
            }

            res.prefixes?.forEach((folderItem) => {
              listData.push({
                type: "folder",
                isParent: false,
                name: folderItem,
                url: null,
              });
            });

            res.objects
              .filter((item) => item.name !== prefixName)
              ?.forEach((item) => {
                listData.push({
                  type: "file",
                  isParent: false,
                  name: `${item.name.replace(prefixName as string, "")}`,
                  url: item.url.replaceAll("http://", "https://"),
                });
              });
            // @ts-ignore
            this.files = listData;
            console.log("加载指定目录---OSS 列表", prefixName, res, this.files);
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

  updateFolder(newFolder: string): void {
    this.files = [];
    this.isInitialized = true;
    this.filterFolder = newFolder;
    this.refresh();
  }
}

export class FileItem extends vscode.TreeItem {
  public tooltip: string;
  public contextValue = "fileItem";

  constructor(
    public readonly name: string,
    public readonly url: string,
    public readonly type: string,
    public readonly isParent: boolean,
    public readonly command?: vscode.Command
  ) {
    super(name);

    // 现在初始化 tooltip 属性
    this.tooltip = `${this.name} - ${this.url}`;
  }
}
