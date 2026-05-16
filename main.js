"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();
const mainWindow = __importStar(require("./main/windows/main-window"));
const mp3Converter = __importStar(require("./main/conversion/mp3Converter"));
const dlPlaylist = __importStar(require("./main/ytdl/download-playlist"));
const menuBar = __importStar(require("./main/menu/menu-bar"));
const onExit = __importStar(require("./main/kill-processes/on-exit"));
const updater = __importStar(require("./main/update/updater"));
const app_notifications_1 = require("./main/kill-processes/app-notifications");
const ytdlUpdater = __importStar(require("./main/update/ytdl-updater"));
const logger_1 = require("./utils/logger");
if (process.argv[2] === "dev") {
    require("electron-reload")(__dirname);
}
electron_1.app.on("ready", () => {
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
    (0, logger_1.keepLogs)(7);
    windows.mainWindow.on("close", (e) => {
        e.preventDefault();
        windows.mainWindow.webContents.send("close-window");
    });
    electron_1.ipcMain.on("close-window-response", (_event, messageKey) => {
        onExit.confirmExit(windows.mainWindow, messageKey);
    });
    electron_1.ipcMain.on("update-ytdl", (event) => {
        ytdlUpdater.checkForUpdates(event);
    });
    electron_1.ipcMain.on("new-playlist", (event, downloadInfo) => {
        dlPlaylist.ipcEvent.downloadInfo = downloadInfo;
        dlPlaylist.ipcEvent.event = event;
        dlPlaylist.staticInfo.downloadFinished = false;
        dlPlaylist.playlist(downloadInfo.url);
    });
    electron_1.ipcMain.on("send-convert-file", (event, fileInfo) => {
        fileInfo.win = windows.mainWindow;
        mp3Converter.convertFiles(fileInfo);
    });
    electron_1.ipcMain.on("stop-convert", (event) => {
        (0, app_notifications_1.killAllProcesses)(() => {
            event.sender.send("stop-convert-response");
        });
    });
    electron_1.ipcMain.on("pageloader", (event, action) => {
        event.sender.send(`${action}-response`);
    });
});
//# sourceMappingURL=main.js.map