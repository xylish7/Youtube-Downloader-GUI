"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const electron_1 = require("electron");
const $pageLoaderContainer = (0, jquery_1.default)("#page-loader-container");
const $convertContent = (0, jquery_1.default)("#convert-content");
electron_1.ipcRenderer.on("hide-download-pageloader-response", () => {
    $convertContent.show();
    $pageLoaderContainer.hide();
});
electron_1.ipcRenderer.on("show-download-pageloader-response", () => {
    $convertContent.hide();
    $pageLoaderContainer.show();
});
const $downloadPageloader = (0, jquery_1.default)("#download-pageloader");
const mp3Conversion = (0, jquery_1.default)("#mp3-conversion");
const keepFilesCheckbox = (0, jquery_1.default)("#keep-files");
electron_1.ipcRenderer.on("hide-convert-pageloader-response", () => {
    $downloadPageloader.hide();
    mp3Conversion.removeAttr("disabled");
});
electron_1.ipcRenderer.on("show-convert-pageloader-response", () => {
    $downloadPageloader.show();
    mp3Conversion.prop("checked", false).attr("disabled", "disabled");
    keepFilesCheckbox.prop("checked", false).attr("disabled", "disabled");
});
//# sourceMappingURL=app-pageloader.js.map