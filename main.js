// Modules
require("hazardous"); // module required when creating installed so spawn can be used
const { app, ipcMain } = require("electron");

// Internal Modules
const mainWindow = require("./main/windows/main-window");
const mp3Converter = require("./main/conversion/mp3Converter");
const dlPlaylist = require("./main/ytdl/download-playlist");
const menuBar = require("./main/menu/menu-bar");
const onExit = require("./main/kill-processes/on-exit");
const updater = require("./main/update/updater");
const { killAllProcesses } = require("./main/kill-processes/app-notifications");
const vcredistInstall = require("./main/vcredist_x86/install");
const ytdlUpdater = require("./main/update/ytdl-updater");

if (process.argv[2] == "dev") {
  require("electron-reload")(__dirname);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", () => {
  // Create windows
  var windows = {
    mainWindow: mainWindow.createWindow()
  };

  // Check for update after x seconds
  if (process.argv[2] == undefined) {
    setTimeout(updater.check, 2000);
  }

  // Check if Microsoft Visual C++ 2010 Redistributable Package (x86) is installed
  // vcredistInstall.check();

  // Create context menu
  windows.mainWindow.webContents.on("context-menu", (e, params) => {
    menuBar.contextMenu.popup(windows.mainWindow, params.x, params.y);
  });

  // Send window object to download video
  dlPlaylist.staticInfo.win = windows.mainWindow;

  // Show notification if processes are in progress
  windows.mainWindow.on("close", e => {
    e.preventDefault();

    windows.mainWindow.webContents.send("close-window");
  });
  ipcMain.on("close-window-response", (event, messageKey) => {
    onExit.confirmExit(windows.mainWindow, messageKey);
  });

  // Search if youtube-dl has any updates to do
  ipcMain.on("update-ytdl", event => {
    ytdlUpdater.checkForUpdates(event);
  });

  // Start new download
  ipcMain.on("new-playlist", (event, downloadInfo) => {
    dlPlaylist.ipcEvent.downloadInfo = downloadInfo;
    dlPlaylist.ipcEvent.event = event;
    dlPlaylist.staticInfo.downloadFinished = false;
    dlPlaylist.playlist(downloadInfo.url);
  });

  // Start conversion
  ipcMain.on("send-convert-file", (event, fileInfo) => {
    fileInfo.win = windows.mainWindow;
    mp3Converter.convertFiles(fileInfo);
  });

  // Stop conversion
  ipcMain.on("stop-convert", event => {
    killAllProcesses();
    event.sender.send("stop-convert-response");
  });

  // Hide page loader for download tab
  ipcMain.on("pageloader", (event, data) => {
    switch (data) {
      case "show-download-pageloader":
        event.sender.send("show-download-pageloader-response");
        break;

      case "hide-download-pageloader":
        event.sender.send("hide-download-pageloader-response");
        break;

      case "show-convert-pageloader":
        event.sender.send("show-convert-pageloader-response");
        break;

      case "hide-convert-pageloader":
        event.sender.send("hide-convert-pageloader-response");
        break;
    }
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) mainWindow.createWindow();
});
