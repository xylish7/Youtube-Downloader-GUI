import { app, ipcMain } from "electron";

const remoteMain = require("@electron/remote/main") as {
  initialize: () => void;
  enable: (wc: Electron.WebContents) => void;
};
remoteMain.initialize();

import * as mainWindow from "./main/windows/main-window";
import * as mp3Converter from "./main/conversion/mp3Converter";
import * as dlPlaylist from "./main/ytdl/download-playlist";
import * as menuBar from "./main/menu/menu-bar";
import * as onExit from "./main/kill-processes/on-exit";
import * as updater from "./main/update/updater";
import { killAllProcesses } from "./main/kill-processes/app-notifications";
import * as ytdlUpdater from "./main/update/ytdl-updater";
import { keepLogs } from "./utils/logger";

if (process.argv[2] === "dev") {
  require("electron-reload")(__dirname);
}

app.on("ready", () => {
  const windows = {
    mainWindow: mainWindow.createWindow(),
  };
  remoteMain.enable(windows.mainWindow.webContents);

  if (process.argv[2] === undefined) {
    setTimeout(updater.check, 2000);
  }

  windows.mainWindow.webContents.on("context-menu", (_e, params) => {
    menuBar.contextMenu.popup({
      window: windows.mainWindow,
      x: params.x,
      y: params.y,
    });
  });

  dlPlaylist.staticInfo.win = windows.mainWindow;

  keepLogs(7);

  windows.mainWindow.on("close", (e) => {
    e.preventDefault();
    windows.mainWindow.webContents.send("close-window");
  });

  ipcMain.on("close-window-response", (_event, messageKey: string) => {
    onExit.confirmExit(windows.mainWindow, messageKey);
  });

  ipcMain.on("update-ytdl", (event) => {
    ytdlUpdater.checkForUpdates(event);
  });

  ipcMain.on("new-playlist", (event, downloadInfo) => {
    dlPlaylist.ipcEvent.downloadInfo = downloadInfo;
    dlPlaylist.ipcEvent.event = event;
    dlPlaylist.staticInfo.downloadFinished = false;
    dlPlaylist.playlist(downloadInfo.url);
  });

  ipcMain.on("send-convert-file", (event, fileInfo) => {
    fileInfo.win = windows.mainWindow;
    mp3Converter.convertFiles(fileInfo);
  });

  ipcMain.on("stop-convert", (event) => {
    killAllProcesses(() => {
      event.sender.send("stop-convert-response");
    });
  });

  ipcMain.on("pageloader", (event, action: string) => {
    event.sender.send(`${action}-response`);
  });
});
