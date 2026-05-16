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
  url: null,
  savePath: null,
  downloadFinished: false,
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
  const inputUrl = $("#input-url");
  const settingsOptions = $(".settings-options");

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
