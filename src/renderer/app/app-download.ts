import $ from "jquery";
import { ipcRenderer, clipboard } from "electron";
import fs from "fs";
import * as appActions from "./app-actions";
import * as appErrors from "./app-errors";
import "../initialize-store-data";
import * as appNotifications from "../../main/kill-processes/app-notifications";

const downloadButton = $("#download-button");
const inputUrl = $("#input-url");
const keepFilesCheckbox = $("#keep-files");
const mp3Conversion = $("#mp3-conversion");
const openFolder = $("#open-download-folder");
const downloadProgressFieldsName = $("#download-progress-fields-name");
const downloadDivider = $("#download-divider");

const conversionNumber = $(".conversion-number");
const downloadLog = $(".download-log");
const notification = $(".notification");
const videoNumber = $(".video-number");

let conversionCount: number;
let alreadyTriggered = false;

appActions.buttonState("search-updates");
ipcRenderer.send("update-ytdl");
ipcRenderer.on("update-ytdl", () => appActions.buttonState("updating"));
ipcRenderer.on("ytdl-update-finished", () => appActions.buttonState("static"));

openFolder.on("click", async () => {
  await appActions.getDownloadPath();
});

appActions.openSavePath();

inputUrl.on("dblclick", () => {
  inputUrl.val(clipboard.readText());
  appActions.disableButton();
});

inputUrl.on("input paste", () => {
  appActions.disableButton();
});

downloadButton.on("click", () => {
  appNotifications.resetValues();

  if (
    !downloadButton.prop("disabled") &&
    !downloadButton.hasClass("fetch-data")
  ) {
    const validationResults: Record<string, boolean> = {};

    validationResults.save_folder_selected = appErrors.validateSaveFolder();
    validationResults.path_not_exist = appErrors.validatePath(
      appActions.downloadInfo.savePath as string,
    );

    if (inputUrl.val() !== "") {
      validationResults.url = appErrors.validateURL();
    }

    if (
      appErrors.validateAll(validationResults, 10000) &&
      validationResults.url
    ) {
      if (downloadButton.hasClass("not-downloading")) {
        if (mp3Conversion.is(":checked"))
          ipcRenderer.send("pageloader", "show-download-pageloader");

        alreadyTriggered = false;

        downloadDivider.attr("data-content", "GET VIDEO/PLAYLIST INFO ...");

        conversionCount = 0;

        if (mp3Conversion.is(":checked"))
          downloadProgressFieldsName.html(
            appActions.progressFieldNames("download-convert"),
          );
        else
          downloadProgressFieldsName.html(
            appActions.progressFieldNames("download"),
          );

        appErrors.largePlaylist();

        downloadLog.empty();
        conversionNumber.empty();
        appActions.setConvertBadge("download-button", "remove-badge");

        appActions.buttonState("fetch-data");

        appActions.getFieldValues();
        ipcRenderer.send("new-playlist", appActions.downloadInfo);
      } else {
        ipcRenderer.send("pageloader", "hide-download-pageloader");
        downloadProgressFieldsName.empty();
        appActions.setConvertBadge("download-button", "remove-badge");
        appActions.buttonState("static");
        downloadLog.empty();
        ipcRenderer.send("stop-download");
        ipcRenderer.on("response", () => {
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

$(".delete").on("click", () => {
  notification.css("display", "none");
});

ipcRenderer.on("playlist-progress", (_event, playlistInfo) => {
  if (playlistInfo.dynamic.playlist_index === 1) {
    appActions.setConvertBadge(
      "download-button",
      playlistInfo.static.n_entries,
      0,
    );
  }

  if (downloadButton.hasClass("fetch-data")) {
    appActions.buttonState("downloading");
    appErrors.largePlaylist(true);
    downloadDivider.attr("data-content", "DOWNLOADING ...");
  }

  if (playlistInfo.static.appendColumns) {
    appActions.downloadInfo.mp3Conversion === "true"
      ? downloadLog.append(
          `${appActions.dynamicContent(
            playlistInfo.dynamic.playlist_index,
            "download-convert",
          )}`,
        )
      : downloadLog.append(
          `${appActions.dynamicContent(
            playlistInfo.dynamic.playlist_index,
            "download",
          )}`,
        );
  }

  if (
    playlistInfo.dynamic.percent === "100.00" &&
    appActions.downloadInfo.mp3Conversion === "false" &&
    playlistInfo.static.isPlaylist !== null
  ) {
    appActions.setConvertBadge(
      "download-button",
      playlistInfo.static.n_entries,
      playlistInfo.dynamic.playlist_index,
    );
  }

  appActions.showProgress(playlistInfo.dynamic);

  if (playlistInfo.static.downloadFinished) {
    appNotifications.exitMessages.download = "download";

    if (
      appActions.downloadInfo.mp3Conversion === "false" &&
      playlistInfo.static.isPlaylist === null
    ) {
      appActions.buttonState("static");
      downloadDivider.attr("data-content", "DOWNLOAD FINISHED!");
    } else {
      downloadDivider.attr(
        "data-content",
        "DOWNLOAD FINISHED! || CONVERTING ...",
      );
    }

    if (
      playlistInfo.dynamic.playlist_index === playlistInfo.static.n_entries &&
      appActions.downloadInfo.mp3Conversion === "false"
    ) {
      appActions.buttonState("static");
      downloadDivider.attr("data-content", "DOWNLOAD FINISHED!");
    }
  }
});

ipcRenderer.on("conversion-percent", (_event, receivedData) => {
  if (receivedData.playlist_index === 1 && !alreadyTriggered) {
    downloadDivider.attr("data-content", "DOWNLOADING ... || CONVERTING ...");
    alreadyTriggered = true;
  }

  $(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val(
    receivedData.percent,
  );
  $(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html(
    `${receivedData.percent}%`,
  );
});

ipcRenderer.on("conversion-done", (_event, receivedData) => {
  if (
    receivedData.conversionFinished &&
    downloadButton.hasClass("is-downloading")
  ) {
    downloadDivider.attr(
      "data-content",
      "DOWNLOAD FINISHED! || CONVRERT FINISHED!",
    );
    appActions.buttonState("static");
    appNotifications.exitMessages.conversion = "conversion";
    ipcRenderer.send("pageloader", "hide-download-pageloader");
  }

  $(`#${receivedData.playlist_index}>.is-3>.conversion-bar`).val("100");
  $(`#${receivedData.playlist_index}>.is-2>.percent-progress`).html("100.00%");

  if (receivedData.isPlaylist !== null) {
    conversionCount++;
    appActions.setConvertBadge(
      "download-button",
      receivedData.n_entries,
      conversionCount,
    );
  }
});

ipcRenderer.on("ytdl-errors", (_event, err) => {
  appErrors.largePlaylist(true);
  appActions.buttonState("static");
  videoNumber.empty();
  appErrors.validateAll({ ytdl_error: false }, 10000);
  downloadDivider.attr("data-content", "ERROR!");
});
