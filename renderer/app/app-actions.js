"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConvertBadge = exports.buttonState = exports.disableButton = exports.showProgress = exports.progressFieldNames = exports.dynamicContent = exports.getFieldValues = exports.openSavePath = exports.getDownloadPath = exports.downloadInfo = void 0;
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
    url: null,
    savePath: null,
    downloadFinished: false,
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
    const inputUrl = (0, jquery_1.default)("#input-url");
    const settingsOptions = (0, jquery_1.default)(".settings-options");
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
const setConvertBadge = (id, lastNumber, firstNumber = 0) => {
    if (lastNumber === "remove-badge") {
        (0, jquery_1.default)(`#${id}`).removeAttr("data-badge");
    }
    else {
        (0, jquery_1.default)(`#${id}`).attr("data-badge", `${firstNumber}/${lastNumber}`);
    }
};
exports.setConvertBadge = setConvertBadge;
//# sourceMappingURL=app-actions.js.map