import $ from "jquery";
import { ipcRenderer, clipboard } from "electron";
import fs from "fs";
import * as appActions from "./app-actions";
import * as appErrors from "./app-errors";
import "../initialize-store-data";
import * as appNotifications from "../../main/kill-processes/app-notifications";

const downloadButton = $("#download-button");
const inputUrl = $("#input-url");
const openFolder = $("#open-download-folder");
const downloadProgressFieldsName = $("#download-progress-fields-name");
const downloadDivider = $("#download-divider");

const downloadLog = $(".download-log");
const notification = $(".notification");
const videoNumber = $(".video-number");

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
        downloadDivider.attr("data-content", "GET VIDEO/PLAYLIST INFO ...");

        downloadProgressFieldsName.html(
          appActions.progressFieldNames("download"),
        );

        appErrors.largePlaylist();

        downloadLog.empty();
        appActions.setConvertBadge("download-button", "remove-badge");

        appActions.buttonState("fetch-data");

        appActions.getFieldValues();
        ipcRenderer.send("new-playlist", appActions.downloadInfo);
      } else {
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
    downloadLog.append(
      `${appActions.dynamicContent(
        playlistInfo.dynamic.playlist_index,
        "download",
      )}`,
    );
  }

  if (
    playlistInfo.dynamic.percent === "100.00" &&
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
    appActions.buttonState("static");
    downloadDivider.attr("data-content", "DOWNLOAD FINISHED!");
  }
});

ipcRenderer.on("ytdl-errors", (_event, err) => {
  appErrors.largePlaylist(true);
  appActions.buttonState("static");
  videoNumber.empty();
  appErrors.validateAll({ ytdl_error: false }, 10000);
  downloadDivider.attr("data-content", "ERROR!");
});

ipcRenderer.on("close-window", () => {
  if (
    downloadButton.hasClass("is-downloading") ||
    downloadButton.hasClass("fetch-data")
  ) {
    ipcRenderer.send("close-window-response", "download");
  } else {
    ipcRenderer.send("close-window-response", "done");
  }
});
