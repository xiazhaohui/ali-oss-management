# README

`ali-oss-management` 是一款运行在 VS Code 的 OSS 资源管理插件，可以方便快捷的自定义 OSS 配置，进行上传图片、视频等静态资源，并支持预览。

## 使用方法

1. 安装插件
在 VS Code 的插件市场中搜索 `ali-oss-management`，安装即可。

2. 配置 OSS 参数
选择 VS Code 的 `File -> Preferences -> Settings`，搜索 `ali-oss-management`，配置 `accessKeyId`、`accessKeySecret`、`region`、`endpoint`、`bucket` 等参数。

> 建议将 `accessKeyId`、`accessKeySecret`、`region`、`endpoint` 四个参数配置到用户软件的私有 `Settings.json` 中，将 `bucket` 配置到项目的  `Settings.json` 的配置中。
>
> 在项目根目录下创建 `.vscode` 文件夹，在文件夹中创建 `Settings.json` 文件，配置 `bucket` 参数，配置文件示例如下：

```json
{
  "ali-oss-management.bucket": "digital-person-daily",
}
```

### 功能概览

- 支持切换文件夹，查看该文件夹内的文件；
- 支持复制文件 OSS 链接；
- 支持预览图片、视频、音频等类型的文件；
- 支持上传图片、视频、音频等类型的文件；
- 支持创建文件夹；

### 操作示例

![示例图](./src/images/upload-file-and-create-folder.gif)
