import * as vscode from "vscode";

export const openBrowserUrl = (url: string) => {
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
};
