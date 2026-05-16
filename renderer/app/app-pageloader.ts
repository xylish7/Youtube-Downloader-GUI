import $ from "jquery";
import { ipcRenderer } from "electron";

const $pageLoaderContainer = $("#page-loader-container");
const $convertContent = $("#convert-content");

ipcRenderer.on("hide-download-pageloader-response", () => {
  $convertContent.show();
  $pageLoaderContainer.hide();
});

ipcRenderer.on("show-download-pageloader-response", () => {
  $convertContent.hide();
  $pageLoaderContainer.show();
});

const $downloadPageloader = $("#download-pageloader");
const mp3Conversion = $("#mp3-conversion");
const keepFilesCheckbox = $("#keep-files");

ipcRenderer.on("hide-convert-pageloader-response", () => {
  $downloadPageloader.hide();
  mp3Conversion.removeAttr("disabled");
});

ipcRenderer.on("show-convert-pageloader-response", () => {
  $downloadPageloader.show();
  mp3Conversion.prop("checked", false).attr("disabled", "disabled");
  keepFilesCheckbox.prop("checked", false).attr("disabled", "disabled");
});
