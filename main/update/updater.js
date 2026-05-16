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
exports.check = void 0;
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const updateWindow = __importStar(require("../windows/update-window"));
electron_updater_1.autoUpdater.autoDownload = false;
const check = () => {
    electron_updater_1.autoUpdater.checkForUpdates();
    electron_updater_1.autoUpdater.on("update-available", () => {
        let downloadProgress = 0;
        let progressWin = null;
        electron_1.dialog
            .showMessageBox({
            type: "info",
            title: "Update Available",
            message: "A new version of Youtube Downloader is available. Do you want to update now?",
            buttons: ["Update", "No"],
        })
            .then(({ response: buttonIndex }) => {
            if (buttonIndex !== 0)
                return;
            electron_updater_1.autoUpdater.downloadUpdate();
            progressWin = updateWindow.createWindow();
            const remoteMain = require("@electron/remote/main");
            remoteMain.enable(progressWin.webContents);
            electron_1.ipcMain.handle("download-progress-request", () => downloadProgress);
            electron_updater_1.autoUpdater.on("download-progress", (d) => {
                downloadProgress = d.percent;
            });
            electron_updater_1.autoUpdater.on("update-downloaded", () => {
                if (progressWin)
                    progressWin.close();
                electron_1.dialog
                    .showMessageBox({
                    type: "info",
                    title: "Update Ready",
                    message: "A new version of Youtube-Downloader is ready. Quit and install now?",
                    buttons: ["Yes", "Later"],
                })
                    .then(({ response: buttonIndex }) => {
                    if (buttonIndex === 0)
                        electron_updater_1.autoUpdater.quitAndInstall();
                });
            });
        });
    });
};
exports.check = check;
//# sourceMappingURL=updater.js.map