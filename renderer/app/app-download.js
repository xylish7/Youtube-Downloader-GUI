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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const electron_1 = require("electron");
const appActions = __importStar(require("./app-actions"));
const appErrors = __importStar(require("./app-errors"));
require("../initialize-store-data");
const appNotifications = __importStar(require("../../main/kill-processes/app-notifications"));
const downloadButton = (0, jquery_1.default)("#download-button");
const inputUrl = (0, jquery_1.default)("#input-url");
const keepFilesCheckbox = (0, jquery_1.default)("#keep-files");
const mp3Conversion = (0, jquery_1.default)("#mp3-conversion");
const openFolder = (0, jquery_1.default)("#open-download-folder");
const downloadProgressFieldsName = (0, jquery_1.default)("#download-progress-fields-name");
const downloadDivider = (0, jquery_1.default)("#download-divider");
const conversionNumber = (0, jquery_1.default)(".conversion-number");
const downloadLog = (0, jquery_1.default)(".download-log");
const notification = (0, jquery_1.default)(".notification");
const videoNumber = (0, jquery_1.default)(".video-number");
let conversionCount;
let alreadyTriggered = false;
appActions.buttonState("search-updates");
electron_1.ipcRenderer.send("update-ytdl");
electron_1.ipcRenderer.on("update-ytdl", () => appActions.buttonState("updating"));
electron_1.ipcRenderer.on("ytdl-update-finished", () => appActions.buttonState("static"));
openFolder.on("click", async () => {
    await appActions.getDownloadPath();
});
appActions.openSavePath();
inputUrl.on("dblclick", () => {
    inputUrl.val(electron_1.clipboard.readText());
    appActions.disableButton();
});
inputUrl.on("input paste", () => {
    appActions.disableButton();
});
downloadButton.on("click", () => {
    appNotifications.resetValues();
    if (!downloadButton.prop("disabled") &&
        !downloadButton.hasClass("fetch-data")) {
        const validationResults = {};
        validationResults.save_folder_selected = appErrors.validateSaveFolder();
        validationResults.path_not_exist = appErrors.validatePath(appActions.downloadInfo.savePath);
        if (inputUrl.val() !== "") {
            validationResults.url = appErrors.validateURL();
        }
        if (appErrors.validateAll(validationResults, 10000) &&
            validationResults.url) {
            if (downloadButton.hasClass("not-downloading")) {
                if (mp3Conversion.is(":checked"))
                    electron_1.ipcRenderer.send("pageloader", "show-download-pageloader");
                alreadyTriggered = false;
                downloadDivider.attr("data-content", "GET VIDEO/PLAYLIST INFO ...");
                conversionCount = 0;
                if (mp3Conversion.is(":checked"))
                    downloadProgressFieldsName.html(appActions.progressFieldNames("download-convert"));
                else
                    downloadProgressFieldsName.html(appActions.progressFieldNames("download"));
                appErrors.largePlaylist();
                downloadLog.empty();
                conversionNumber.empty();
                appActions.setConvertBadge("download-button", "remove-badge");
                appActions.buttonState("fetch-data");
                appActions.getFieldValues();
                electron_1.ipcRenderer.send("new-playlist", appActions.downloadInfo);
            }
            else {
                electron_1.ipcRenderer.send("pageloader", "hide-download-pageloader");
                downloadProgressFieldsName.empty();
                appActions.setConvertBadge("download-button", "remove-badge");
                appActions.buttonState("static");
                downloadLog.empty();
                electron_1.ipcRenderer.send("stop-download");
                electron_1.ipcRenderer.on("response", () => {
                    downloadDivider.attr("data-content", "DOWNLOAD STOPPED!");
                });
            }
        }
    }
});
mp3Conversion.on("click", () => {
    mp3Conversion.is(":checked")
        ? keepFilesCheckbox.removeAttr("disabled")
        : keepFilesCheckbox.prop("checked", false).attr("disabled", "true");
});
(0, jquery_1.default)(".delete").on("click", () => {
    notification.css("display", "none");
});
electron_1.ipcRenderer.on("playlist-progress", (_event, playlistInfo) => {
    if (playlistInfo.dynamic.playlist_index === 1) {
        appActions.setConvertBadge("download-button", playlistInfo.static.n_entries, 0);
    }
    if (downloadButton.hasClass("fetch-data")) {
        appActions.buttonState("downloading");
        appErrors.largePlaylist(true);
        downloadDivider.attr("data-content", "DOWNLOADING ...");
    }
    if (playlistInfo.static.appendColumns) {
        appActions.downloadInfo.mp3Conversion === "true"
            ? downloadLog.append(`${appActions.dynamicContent(playlistInfo.dynamic.playlist_index, "download-convert")}`)
            : downloadLog.append(`${appActions.dynamicContent(playlistInfo.dynamic.playlist_index, "download")}`);
    }
    if (playlistInfo.dynamic.percent === "100.00" &&
        appActions.downloadInfo.mp3Conversion === "false" &&
        playlistInfo.static.isPlaylist !== null) {
        appActions.setConvertBadge("download-button", playlistInfo.static.n_entries, playlistInfo.dynamic.playlist_index);
    }
    appActions.showProgress(playlistInfo.dynamic);
    if (playlistInfo.static.downloadFinished) {
        appNotifications.exitMessages.download = "download";
        if (appActions.downloadInfo.mp3Conversion === "false" &&
            playlistInfo.static.isPlaylist === null) {
            appActions.buttonState("static");
            downloadDivider.attr("data-content", "DOWNLOAD FINISHED!");
        }
        else {
            downloadDivider.attr("data-content", "DOWNLOAD FINISHED! || CONVERTING ...");
        }
        if (playlistInfo.dynamic.playlist_index === playlistInfo.static.n_entries &&
            appActions.downloadInfo.mp3Conversion === "false") {
            appActions.buttonState("static");
            downloadDivider.attr("data-content", "DOWNLOAD FINISHED!");
        }
    }
});
electron_1.ipcRenderer.on("conversion-percent", (_event, receivedData) => {
    if (receivedData.playlist_index === 1 && !alreadyTriggered) {
        downloadDivider.attr("data-content", "DOWNLOADING ... || CONVERTING ...");
        alreadyTriggered = true;
    }
    (0, jquery_1.default)(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val(receivedData.percent);
    (0, jquery_1.default)(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html(`${receivedData.percent}%`);
});
electron_1.ipcRenderer.on("conversion-done", (_event, receivedData) => {
    if (receivedData.conversionFinished &&
        downloadButton.hasClass("is-downloading")) {
        downloadDivider.attr("data-content", "DOWNLOAD FINISHED! || CONVRERT FINISHED!");
        appActions.buttonState("static");
        appNotifications.exitMessages.conversion = "conversion";
        electron_1.ipcRenderer.send("pageloader", "hide-download-pageloader");
    }
    (0, jquery_1.default)(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val("100");
    (0, jquery_1.default)(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html("100.00%");
    if (receivedData.isPlaylist !== null) {
        conversionCount++;
        appActions.setConvertBadge("download-button", receivedData.n_entries, conversionCount);
    }
});
electron_1.ipcRenderer.on("ytdl-errors", (_event, err) => {
    appErrors.largePlaylist(true);
    appActions.buttonState("static");
    videoNumber.empty();
    appErrors.validateAll({ ytdl_error: false }, 10000);
    downloadDivider.attr("data-content", "ERROR!");
});
//# sourceMappingURL=app-download.js.map