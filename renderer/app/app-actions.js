"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSameFormat = exports.convertButtonState = exports.setConvertBadge = exports.getConvertPath = exports.getConvertOptions = exports.emptyProgressBars = exports.getConvertFiles = exports.buttonState = exports.disableButton = exports.showProgress = exports.progressFieldNames = exports.dynamicContent = exports.getFieldValues = exports.openSavePath = exports.getDownloadPath = exports.conversionInfo = exports.downloadInfo = void 0;
const jquery_1 = __importDefault(require("jquery"));
const remote_1 = require("@electron/remote");
const electron_1 = require("electron");
const store_1 = __importDefault(require("../store"));
const store = new store_1.default({
    configName: "user-preferences",
    defaults: {},
});
// --------------------------- Download -------------------- //
exports.downloadInfo = {
    mp3Conversion: null,
    keepFilesCheckbox: null,
    url: null,
    savePath: null,
    downloadFinished: false,
};
exports.conversionInfo = {
    conversionFinished: false,
};
const getDownloadPath = async () => {
    const messagePath = (0, jquery_1.default)("#path-message");
    const articlePath = (0, jquery_1.default)("#path-article");
    const inputUrl = (0, jquery_1.default)("#input-url");
    const downloadButton = (0, jquery_1.default)("#download-button");
    const result = await remote_1.dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const savePath = result.filePaths[0];
        store.set("savePath", savePath);
        messagePath.html(`<i>${savePath}</i>`);
        articlePath.show();
        if (inputUrl.val() !== "") {
            downloadButton.removeAttr("disabled");
        }
        exports.downloadInfo.savePath = savePath;
    }
};
exports.getDownloadPath = getDownloadPath;
const openSavePath = () => {
    const pathFolder = (0, jquery_1.default)("#open-download-explorer");
    const messagePath = (0, jquery_1.default)("#path-message");
    pathFolder.on("click", function () {
        const p = messagePath.text().replace("Save Path: ", "").trim();
        electron_1.shell.openPath(p);
    });
};
exports.openSavePath = openSavePath;
const getFieldValues = () => {
    const mp3Conversion = (0, jquery_1.default)("#mp3-conversion");
    const keepFilesCheckbox = (0, jquery_1.default)("#keep-files");
    const inputUrl = (0, jquery_1.default)("#input-url");
    const settingsOptions = (0, jquery_1.default)(".settings-options");
    exports.downloadInfo.mp3Conversion = mp3Conversion.is(":checked")
        ? mp3Conversion.val()
        : "false";
    exports.downloadInfo.keepFilesCheckbox = keepFilesCheckbox.is(":checked")
        ? keepFilesCheckbox.val()
        : "false";
    const url = inputUrl.val();
    if (url.search("list") > 0)
        exports.downloadInfo.url = url.replace(/(v=[^&]*&)/, "");
    else
        exports.downloadInfo.url = url;
    const downloadInfoCopy = exports.downloadInfo;
    settingsOptions.each(function () {
        const id = (0, jquery_1.default)(this).attr("id")
            .replace("-option", "")
            .replace("-", "_");
        downloadInfoCopy[id] = (0, jquery_1.default)(this).val();
    });
    exports.downloadInfo = downloadInfoCopy;
};
exports.getFieldValues = getFieldValues;
const dynamicContent = (data, caseName) => {
    switch (caseName) {
        case "download-convert":
            return `<div id='${data}' class="columns is-mobile is-gapless">
          <div class="column is-4">
            <p class="video-title"></p>
          </div>
          <div  class="column is-3">
            <progress class="progress progress-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div  class="column is-3">
            <progress class="progress conversion-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div class="column is-2">
            <p class="percent-progress"></p>
          </div>
        </div>`;
        case "download":
            return `<div id='${data}' class="columns is-mobile is-gapless">
          <div class="column is-4">
            <p class="video-title"></p>
          </div>
          <div  class="column is-6">
            <progress class="progress progress-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div class="column is-2">
            <p class="percent-progress"></p>
          </div>
        </div>`;
        case "convert":
            return `<div id='${data}' class="columns is-mobile is-gapless">
          <div class="column is-4">
            <p class="video-title"></p>
          </div>
          <div  class="column is-6">
            <progress class="progress progress-bar is-danger is-small" value="0" max="100"></progress>
          </div>
          <div class="column is-2">
            <p class="percent-progress"></p>
          </div>
        </div>`;
        default:
            return "";
    }
};
exports.dynamicContent = dynamicContent;
const progressFieldNames = (caseName) => {
    switch (caseName) {
        case "download-convert":
            return `<div class="column is-4">
          <span class="is-size-7" style="margin-left:35px"><strong>Title</strong></span>
        </div>
        <div class="column is-3">
          <span class="is-size-7" style="margin-left:17px"><strong>Download bar</strong></span>
        </div>
        <div class="column is-3">
          <span class="is-size-7" style="margin-left:-19px"><strong>Convert bar</strong></span>
        </div>
        <div class="column is-2">
          <span class="is-size-7" style="margin-left:-55px"><strong>Prog.</strong></span>
        </div>`;
        case "download":
            return ` <div class="column is-4">
          <span class="is-size-7" style="margin-left:35px"><strong>Title</strong></span>
        </div>
        <div class="column is-6">
          <span class="is-size-7" style="margin-left:5px"><strong>Download bar</strong></span>
        </div>
        <div class="column is-2">
          <span class="is-size-7" style="margin-left:-55px"><strong>Prog.</strong></span>
        </div>`;
        case "convert":
            return ` <div class="column is-4">
          <span class="is-size-7" style="margin-left:35px"><strong>Title</strong></span>
        </div>
        <div class="column is-6">
          <span class="is-size-7" style="margin-left:5px"><strong>Convert bar</strong></span>
        </div>
        <div class="column is-2">
          <span class="is-size-7" style="margin-left:-55px"><strong>Prog.</strong></span>
        </div>`;
        default:
            return "";
    }
};
exports.progressFieldNames = progressFieldNames;
const showProgress = (data) => {
    const downloadLog = (0, jquery_1.default)(".download-log");
    const progressBar = ".progress-bar";
    const videoTitle = ".video-title";
    const percentProgress = ".percent-progress";
    downloadLog.find(progressBar).last().val(data.percent);
    downloadLog.find(percentProgress).last().html(`${data.percent}%`);
    downloadLog.find(videoTitle).last().html(`${data.title}`);
};
exports.showProgress = showProgress;
const disableButton = () => {
    const articlePath = (0, jquery_1.default)("#path-article");
    const inputUrl = (0, jquery_1.default)("#input-url");
    const downloadButton = (0, jquery_1.default)("#download-button");
    if (articlePath.css("display") !== "none" && inputUrl.val() !== "")
        downloadButton.removeAttr("disabled");
    else
        downloadButton.attr("disabled", "true");
};
exports.disableButton = disableButton;
const buttonState = (state) => {
    const downloadButton = (0, jquery_1.default)("#download-button");
    const inputUrl = (0, jquery_1.default)("#input-url");
    const buttonMessage = (0, jquery_1.default)("#button-message");
    const buttonIcon = (0, jquery_1.default)("#button-icon");
    switch (state) {
        case "static":
            downloadButton
                .addClass("not-downloading")
                .removeClass("is-downloading fetch-data");
            inputUrl.removeAttr("disabled");
            buttonMessage.html("Start-download");
            buttonIcon
                .removeClass("fas fa-spinner fa-sync fa-spin fa-pulse")
                .addClass("fa fa-download");
            break;
        case "fetch-data":
            downloadButton.removeClass("not-downloading").addClass("fetch-data");
            inputUrl.attr("disabled", "true");
            buttonMessage.html("Fetching data...");
            buttonIcon.removeClass("fa fa-download").addClass("fas fa-sync fa-spin");
            break;
        case "search-updates":
            downloadButton.removeClass("not-downloading").addClass("search-update");
            inputUrl.attr("disabled", "true");
            buttonMessage.html("Find updates...");
            buttonIcon.removeClass("fa fa-download").addClass("fas fa-sync fa-spin");
            break;
        case "updating":
            downloadButton.addClass("updating").removeClass("search-update");
            inputUrl.attr("disabled", "true");
            buttonMessage.html("Updating...");
            buttonIcon
                .removeClass("fas fa-sync fa-spin")
                .addClass("fas fa-spinner fa-pulse");
            break;
        case "downloading":
            downloadButton.addClass("is-downloading").removeClass("fetch-data");
            inputUrl.attr("disabled", "true");
            buttonMessage.html("Stop-download!");
            buttonIcon
                .removeClass("fas fa-sync fa-spin")
                .addClass("fas fa-spinner fa-pulse");
            break;
    }
};
exports.buttonState = buttonState;
// ---------------- Convert ---------------- //
const getConvertFiles = async (filter) => {
    const result = await remote_1.dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [filter],
    });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    return result.filePaths;
};
exports.getConvertFiles = getConvertFiles;
const emptyProgressBars = (index, title) => {
    const $convertLog = (0, jquery_1.default)(".convert-log");
    const videoTitle = ".video-title";
    const percentProgress = ".percent-progress";
    const progressBar = ".progress-bar ";
    $convertLog.append(`${(0, exports.dynamicContent)(`convert-${index + 1}`, "convert")}`);
    $convertLog.find(videoTitle).last().html(`${title}`);
    $convertLog.find(percentProgress).last().html("0%");
    $convertLog.find(progressBar).last().val("0");
};
exports.emptyProgressBars = emptyProgressBars;
const getConvertOptions = () => {
    let $deleteFiles = (0, jquery_1.default)("#delete-convert-files");
    const deleteFilesVal = $deleteFiles.is(":checked")
        ? $deleteFiles.val()
        : "false";
    const $convertAudioRadio = (0, jquery_1.default)("#convert-audio-radio");
    const audio_or_video_format = $convertAudioRadio.attr("checked") === "checked"
        ? (0, jquery_1.default)("#convert-audio-format-option").val()
        : (0, jquery_1.default)("#convert-video-format-option").val();
    return {
        audio_or_video_format,
        audio_quality: (0, jquery_1.default)("#convert-audio-quality-option").val(),
        no_processes: (0, jquery_1.default)("#convert-no-processes-option").val(),
        delete_files: deleteFilesVal,
    };
};
exports.getConvertOptions = getConvertOptions;
const getConvertPath = (pathWithTitle) => {
    return pathWithTitle.substring(0, pathWithTitle.lastIndexOf("\\"));
};
exports.getConvertPath = getConvertPath;
const setConvertBadge = (id, lastNumber, firstNumber = 0) => {
    if (lastNumber === "remove-badge") {
        (0, jquery_1.default)(`#${id}`).removeAttr("data-badge");
    }
    else {
        (0, jquery_1.default)(`#${id}`).attr("data-badge", `${firstNumber}/${lastNumber}`);
    }
};
exports.setConvertBadge = setConvertBadge;
const convertButtonState = (state) => {
    const convertButton = (0, jquery_1.default)("#start-conversion");
    const buttonMessage = (0, jquery_1.default)("#convert-button-message");
    const buttonIcon = (0, jquery_1.default)("#convert-button-icon");
    switch (state) {
        case "static":
            convertButton.addClass("not-converting").removeClass("is-converting");
            buttonMessage.html("Start-conversion");
            buttonIcon
                .removeClass("fas fa-spinner fa-pulse")
                .addClass("far fa-arrow-alt-circle-right");
            break;
        case "converting":
            convertButton.addClass("is-converting").removeClass("not-converting");
            buttonMessage.html("Stop-conversion!");
            buttonIcon
                .removeClass("fas fa-sync fa-spin")
                .addClass("fas fa-spinner fa-pulse");
            break;
    }
};
exports.convertButtonState = convertButtonState;
const removeSameFormat = (converFilesArray) => {
    const $convertAudioRadio = (0, jquery_1.default)("#convert-audio-radio");
    const audio_or_video_format = $convertAudioRadio.attr("checked") === "checked"
        ? (0, jquery_1.default)("#convert-audio-format-option").val()
        : (0, jquery_1.default)("#convert-video-format-option").val();
    return converFilesArray.filter((file) => file.substring(file.lastIndexOf(".")) !== `.${audio_or_video_format}`);
};
exports.removeSameFormat = removeSameFormat;
//# sourceMappingURL=app-actions.js.map