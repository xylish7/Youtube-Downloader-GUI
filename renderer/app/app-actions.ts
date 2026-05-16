import $ from "jquery";
import { dialog } from "@electron/remote";
import { shell } from "electron";
import Store from "../store";

const store = new Store({
  configName: "user-preferences",
  defaults: {},
});

// --------------------------- Download -------------------- //

export let downloadInfo: Record<string, any> = {
  mp3Conversion: null,
  keepFilesCheckbox: null,
  url: null,
  savePath: null,
  downloadFinished: false,
};

export const conversionInfo = {
  conversionFinished: false,
};

export const getDownloadPath = async (): Promise<void> => {
  const messagePath = $("#path-message");
  const articlePath = $("#path-article");
  const inputUrl = $("#input-url");
  const downloadButton = $("#download-button");

  const result = await dialog.showOpenDialog({
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

    downloadInfo.savePath = savePath;
  }
};

export const openSavePath = (): void => {
  const pathFolder = $("#open-download-explorer");
  const messagePath = $("#path-message");
  pathFolder.on("click", function () {
    const p = messagePath.text().replace("Save Path: ", "").trim();
    shell.openPath(p);
  });
};

export const getFieldValues = (): void => {
  const mp3Conversion = $("#mp3-conversion");
  const keepFilesCheckbox = $("#keep-files");
  const inputUrl = $("#input-url");
  const settingsOptions = $(".settings-options");

  downloadInfo.mp3Conversion = mp3Conversion.is(":checked")
    ? mp3Conversion.val()
    : "false";
  downloadInfo.keepFilesCheckbox = keepFilesCheckbox.is(":checked")
    ? keepFilesCheckbox.val()
    : "false";

  const url = inputUrl.val() as string;
  if (url.search("list") > 0) downloadInfo.url = url.replace(/(v=[^&]*&)/, "");
  else downloadInfo.url = url;

  const downloadInfoCopy: Record<string, any> = downloadInfo;
  settingsOptions.each(function () {
    const id = ($(this).attr("id") as string)
      .replace("-option", "")
      .replace("-", "_");
    downloadInfoCopy[id] = $(this).val();
  });
  downloadInfo = downloadInfoCopy;
};

export const dynamicContent = (
  data: string | number,
  caseName: string,
): string => {
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

export const progressFieldNames = (caseName: string): string => {
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

export const showProgress = (data: any): void => {
  const downloadLog = $(".download-log");
  const progressBar = ".progress-bar";
  const videoTitle = ".video-title";
  const percentProgress = ".percent-progress";

  downloadLog.find(progressBar).last().val(data.percent);
  downloadLog.find(percentProgress).last().html(`${data.percent}%`);
  downloadLog.find(videoTitle).last().html(`${data.title}`);
};

export const disableButton = (): void => {
  const articlePath = $("#path-article");
  const inputUrl = $("#input-url");
  const downloadButton = $("#download-button");

  if (articlePath.css("display") !== "none" && inputUrl.val() !== "")
    downloadButton.removeAttr("disabled");
  else downloadButton.attr("disabled", "true");
};

export const buttonState = (state: string): void => {
  const downloadButton = $("#download-button");
  const inputUrl = $("#input-url");
  const buttonMessage = $("#button-message");
  const buttonIcon = $("#button-icon");

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

// ---------------- Convert ---------------- //

export const getConvertFiles = async (filter: {
  name: string;
  extensions: string[];
}): Promise<string[] | null> => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [filter],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths;
};

export const emptyProgressBars = (index: number, title: string): void => {
  const $convertLog = $(".convert-log");
  const videoTitle = ".video-title";
  const percentProgress = ".percent-progress";
  const progressBar = ".progress-bar ";

  $convertLog.append(`${dynamicContent(`convert-${index + 1}`, "convert")}`);
  $convertLog.find(videoTitle).last().html(`${title}`);
  $convertLog.find(percentProgress).last().html("0%");
  $convertLog.find(progressBar).last().val("0");
};

export const getConvertOptions = (): Record<string, any> => {
  let $deleteFiles = $("#delete-convert-files");
  const deleteFilesVal = $deleteFiles.is(":checked")
    ? $deleteFiles.val()
    : "false";

  const $convertAudioRadio = $("#convert-audio-radio");
  const audio_or_video_format =
    $convertAudioRadio.attr("checked") === "checked"
      ? $("#convert-audio-format-option").val()
      : $("#convert-video-format-option").val();

  return {
    audio_or_video_format,
    audio_quality: $("#convert-audio-quality-option").val(),
    no_processes: $("#convert-no-processes-option").val(),
    delete_files: deleteFilesVal,
  };
};

export const getConvertPath = (pathWithTitle: string): string => {
  return pathWithTitle.substring(0, pathWithTitle.lastIndexOf("\\"));
};

export const setConvertBadge = (
  id: string,
  lastNumber: number | string,
  firstNumber = 0,
): void => {
  if (lastNumber === "remove-badge") {
    $(`#${id}`).removeAttr("data-badge");
  } else {
    $(`#${id}`).attr("data-badge", `${firstNumber}/${lastNumber}`);
  }
};

export const convertButtonState = (state: string): void => {
  const convertButton = $("#start-conversion");
  const buttonMessage = $("#convert-button-message");
  const buttonIcon = $("#convert-button-icon");

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

export const removeSameFormat = (converFilesArray: string[]): string[] => {
  const $convertAudioRadio = $("#convert-audio-radio");
  const audio_or_video_format =
    $convertAudioRadio.attr("checked") === "checked"
      ? ($("#convert-audio-format-option").val() as string)
      : ($("#convert-video-format-option").val() as string);

  return converFilesArray.filter(
    (file) =>
      file.substring(file.lastIndexOf(".")) !== `.${audio_or_video_format}`,
  );
};
