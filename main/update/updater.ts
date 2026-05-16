import { dialog, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import * as updateWindow from "../windows/update-window";

autoUpdater.autoDownload = false;

export const check = (): void => {
  autoUpdater.checkForUpdates();

  autoUpdater.on("update-available", () => {
    let downloadProgress = 0;
    let progressWin: BrowserWindow | null = null;

    dialog
      .showMessageBox({
        type: "info",
        title: "Update Available",
        message:
          "A new version of Youtube Downloader is available. Do you want to update now?",
        buttons: ["Update", "No"],
      })
      .then(({ response: buttonIndex }) => {
        if (buttonIndex !== 0) return;

        autoUpdater.downloadUpdate();

        progressWin = updateWindow.createWindow();
        const remoteMain = require("@electron/remote/main") as {
          enable: (wc: Electron.WebContents) => void;
        };
        remoteMain.enable(progressWin.webContents);

        ipcMain.handle("download-progress-request", () => downloadProgress);

        autoUpdater.on("download-progress", (d) => {
          downloadProgress = d.percent;
        });

        autoUpdater.on("update-downloaded", () => {
          if (progressWin) progressWin.close();

          dialog
            .showMessageBox({
              type: "info",
              title: "Update Ready",
              message:
                "A new version of Youtube-Downloader is ready. Quit and install now?",
              buttons: ["Yes", "Later"],
            })
            .then(({ response: buttonIndex }) => {
              if (buttonIndex === 0) autoUpdater.quitAndInstall();
            });
        });
      });
  });
};
