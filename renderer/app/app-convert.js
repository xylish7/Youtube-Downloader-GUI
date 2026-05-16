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
const appNotifications = __importStar(require("../../main/kill-processes/app-notifications"));
const $startConversion = (0, jquery_1.default)("#start-conversion");
const $openConvertFolder = (0, jquery_1.default)("#open-convert-folder");
const $convertAudioRadio = (0, jquery_1.default)("#convert-audio-radio");
const $convertVideoRadio = (0, jquery_1.default)("#convert-video-radio");
const $convertProgressFieldsName = (0, jquery_1.default)("#convert-progress-fields-name");
const $convertDivider = (0, jquery_1.default)("#convert-divider");
const $openConvertedFolder = (0, jquery_1.default)("#open-converted-folder");
const $convertAudioFormatOption = (0, jquery_1.default)("#convert-audio-format-option");
const $convertNotification = (0, jquery_1.default)(".convert-notification");
const $convertLog = (0, jquery_1.default)(".convert-log");
(0, jquery_1.default)(".is-checkradio").on("click", function () {
    if ((0, jquery_1.default)(this).attr("id") === "convert-video-radio") {
        $convertAudioRadio.removeAttr("checked");
        $convertVideoRadio.attr("checked", "checked");
    }
    else {
        $convertAudioRadio.attr("checked", "checked");
        $convertVideoRadio.removeAttr("checked");
    }
});
const fileFilter = {
    video: { name: "Video", extensions: ["mkv", "avi", "mp4", "webm", "3gp"] },
    audio: {
        name: "Audio",
        extensions: [
            "mp3",
            "m4a",
            "ogg",
            "wma",
            "mkv",
            "avi",
            "mp4",
            "webm",
            "3gp",
        ],
    },
};
let initialFiles = null;
let convertFiles = [];
let originalFiles = [];
let conversionCount = 0;
$openConvertFolder.on("click", async () => {
    if (!$openConvertFolder.prop("disabled")) {
        initialFiles =
            $convertAudioRadio.attr("checked") === "checked"
                ? await appActions.getConvertFiles(fileFilter.audio)
                : await appActions.getConvertFiles(fileFilter.video);
        if (initialFiles) {
            convertFiles = initialFiles;
            originalFiles = initialFiles;
            convertFiles = appActions.removeSameFormat(convertFiles);
            if (convertFiles.length !== originalFiles.length) {
                appErrors.validateAll({ files_removed: false }, 10000, "convert-notification");
            }
        }
        if (conversionCount > 0 && !initialFiles) {
            // do nothing
        }
        else {
            setNumberOfConversions();
        }
    }
});
$convertAudioFormatOption.on("change", function () {
    if (convertFiles.length > 0) {
        convertFiles = appActions.removeSameFormat(originalFiles);
        if (convertFiles.length !== originalFiles.length) {
            appErrors.validateAll({ files_removed: false }, 10000, "convert-notification");
        }
        setNumberOfConversions();
    }
});
$startConversion.on("click", () => {
    if ($startConversion.hasClass("not-converting") &&
        !$startConversion.attr("disabled")) {
        appNotifications.exitMessages.conversion = null;
        appNotifications.exitMessages.download = "download";
        electron_1.ipcRenderer.send("pageloader", "show-convert-pageloader");
        $convertDivider.attr("data-content", "CONVERTING ...");
        $openConvertFolder.prop("disabled", true).attr("disabled", "true");
        appActions.convertButtonState("converting");
        conversionCount = 0;
        const fileInfo = appActions.getConvertOptions();
        fileInfo.n_entries = convertFiles.length;
        fileInfo.savePath = appActions.getConvertPath(convertFiles[0]);
        convertFiles.forEach((file, index) => {
            fileInfo.filePath = file;
            fileInfo.title = file.substring(file.lastIndexOf("\\") + 1, file.lastIndexOf("."));
            fileInfo.index = index + 1;
            fileInfo.original_format = file.substring(file.lastIndexOf("."));
            appActions.emptyProgressBars(index, fileInfo.title);
            electron_1.ipcRenderer.send("send-convert-file", fileInfo);
        });
    }
    else {
        if ($startConversion.hasClass("is-converting")) {
            electron_1.ipcRenderer.send("stop-convert");
            electron_1.ipcRenderer.on("stop-convert-response", () => {
                electron_1.ipcRenderer.send("pageloader", "hide-convert-pageloader");
                $convertDivider.attr("data-content", "PROCESS STOPPED!");
                $convertLog.empty();
                convertFiles = [];
                appActions.setConvertBadge("start-conversion", "remove-badge");
                $startConversion.attr("disabled", "true");
                appActions.convertButtonState("static");
                $openConvertFolder.removeProp("disabled").removeAttr("disabled");
            });
        }
    }
});
electron_1.ipcRenderer.on("convert-file-progress", (_event, receivedData) => {
    (0, jquery_1.default)(`#convert-${receivedData.index}>.is-6>.progress-bar`).val(receivedData.percent);
    (0, jquery_1.default)(`#convert-${receivedData.index}>.is-2>.percent-progress`).html(`${receivedData.percent} %`);
    if (receivedData.fileConverted) {
        conversionCount++;
        appActions.setConvertBadge("start-conversion", convertFiles.length, conversionCount);
    }
    if (conversionCount === convertFiles.length) {
        appNotifications.exitMessages.conversion = "conversion";
        appNotifications.exitMessages.download = "download";
        electron_1.ipcRenderer.send("pageloader", "hide-convert-pageloader");
        $convertDivider.attr("data-content", "CONVERT FINISHED!");
        $openConvertFolder.removeProp("disabled").removeAttr("disabled");
        appActions.convertButtonState("static");
        $startConversion.attr("disabled", "true");
    }
});
(0, jquery_1.default)(".delete").on("click", () => {
    $convertNotification.css("display", "none");
});
$openConvertedFolder.on("click", () => {
    if (convertFiles) {
        if (convertFiles.length > 0) {
            const p = convertFiles[0].substring(0, convertFiles[0].lastIndexOf("\\"));
            electron_1.shell.openPath(p);
        }
    }
    else {
        appErrors.validateAll({ no_files_selected: false }, 10000, "convert-notification");
    }
});
function setNumberOfConversions() {
    if (convertFiles.length > 0) {
        $convertLog.empty();
        $convertProgressFieldsName.html(appActions.progressFieldNames("convert"));
        $startConversion.removeAttr("disabled");
        appActions.setConvertBadge("start-conversion", convertFiles.length);
    }
    else {
        if (!(conversionCount > 0) && initialFiles && initialFiles.length > 0)
            appActions.setConvertBadge("start-conversion", "remove-badge");
        $startConversion.attr("disabled", "true");
        appErrors.validateAll({ no_files_to_convert: false }, 10000, "convert-notification");
    }
}
const downloadButton = (0, jquery_1.default)("#download-button");
electron_1.ipcRenderer.on("close-window", (_event, ...args) => {
    const event = args[0];
    const exitMessages = appNotifications.exitMessages;
    for (const key in exitMessages) {
        if (Object.prototype.hasOwnProperty.call(exitMessages, key)) {
            const val = exitMessages[key];
            if ((!val &&
                (downloadButton.hasClass("is-downloading") ||
                    downloadButton.hasClass("fetch-data"))) ||
                (!val && (0, jquery_1.default)("#start-conversion").hasClass("is-converting"))) {
                electron_1.ipcRenderer.send("close-window-response", key);
                appNotifications.noProcessActive = null;
                break;
            }
            else {
                appNotifications.noProcessActive = true;
            }
        }
    }
    if (appNotifications.noProcessActive)
        electron_1.ipcRenderer.send("close-window-response", "done");
});
electron_1.ipcRenderer.on("debug", (_event, data) => {
    console.log(data);
});
//# sourceMappingURL=app-convert.js.map