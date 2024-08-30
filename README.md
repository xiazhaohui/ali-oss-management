# ali-oss-management README

一款运行在 VS Code 的 OSS 资源管理插件，可以方便快捷的自定义 OSS 配置，进行上传图片、视频等静态资源，并支持预览。

## 运行

fn + F5 或者 点击“运行和调试”活动栏的 Run Extension，即可成功运行一个vscode

## 调试

option + command + i 打开 vscode 的控制器

## 打包

```bash
# vsce 是一个用于将插件发布到市场上的命令行工具
npm install -g @vacode/vecs
```

```bash
# 这个命令会在当前目录生成一个.vsix文件，将这个文件直接拖到 VS Code Extension就可以直接安装使用
vsce package
```

## 发布

打开网站 [Extensions for Visual Studio Code](https://marketplace.visualstudio.com/)，选择 `publish extensions`，依次配置 Name、ID 等信息。

在[管理页面](https://marketplace.visualstudio.com/manage/publishers)手动发布，将.vsix文件拖拽上传，等待几分钟即可验证。
