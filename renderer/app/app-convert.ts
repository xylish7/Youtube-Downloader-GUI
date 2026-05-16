import $ from "jquery";
import { ipcRenderer, shell } from "electron";
import * as appActions from "./app-actions";
import * as appErrors from "./app-errors";
import * as appNotifications from "../../main/kill-processes/app-notifications";
import * as mp3Converter from "../../main/conversion/mp3Converter";

const $startConversion = $("#start-conversion");
const $openConvertFolder = $("#open-convert-folder");
const $convertAudioRadio = $("#convert-audio-radio");
const $convertVideoRadio = $("#convert-video-radio");
const $convertProgressFieldsName = $("#convert-progress-fields-name");
const $convertDivider = $("#convert-divider");
const $openConvertedFolder = $("#open-converted-folder");
const $convertAudioFormatOption = $("#convert-audio-format-option");

const $convertNotification = $(".convert-notification");
const $convertLog = $(".convert-log");

$(".is-checkradio").on("click", function () {
  if ($(this).attr("id") === "convert-video-radio") {
    $convertAudioRadio.removeAttr("checked");
    $convertVideoRadio.attr("checked", "checked");
  } else {
    $convertAudioRadio.attr("checked", "checked");
    $convertVideoRadio.removeAttr("checked");
  }
});

const fileFilter: Record<string, { name: string; extensions: string[] }> = {
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

let initialFiles: string[] | null = null;
let convertFiles: string[] = [];
let originalFiles: string[] = [];
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
        appErrors.validateAll(
          { files_removed: false },
          10000,
          "convert-notification",
        );
      }
    }

    if (conversionCount > 0 && !initialFiles) {
      // do nothing
    } else {
      setNumberOfConversions();
    }
  }
});

$convertAudioFormatOption.on("change", function () {
  if (convertFiles.length > 0) {
    convertFiles = appActions.removeSameFormat(originalFiles);
    if (convertFiles.length !== originalFiles.length) {
      appErrors.validateAll(
        { files_removed: false },
        10000,
        "convert-notification",
      );
    }
    setNumberOfConversions();
  }
});

$startConversion.on("click", () => {
  if (
    $startConversion.hasClass("not-converting") &&
    !$startConversion.attr("disabled")
  ) {
    appNotifications.exitMessages.conversion = null;
    appNotifications.exitMessages.download = "download";
    ipcRenderer.send("pageloader", "show-convert-pageloader");
    $convertDivider.attr("data-content", "CONVERTING ...");
    $openConvertFolder.prop("disabled", true).attr("disabled", "true");
    appActions.convertButtonState("converting");

    conversionCount = 0;
    const fileInfo: any = appActions.getConvertOptions();
    fileInfo.n_entries = convertFiles.length;
    fileInfo.savePath = appActions.getConvertPath(convertFiles[0]);

    convertFiles.forEach((file, index) => {
      fileInfo.filePath = file;
      fileInfo.title = file.substring(
        file.lastIndexOf("\\") + 1,
        file.lastIndexOf("."),
      );
      fileInfo.index = index + 1;
      fileInfo.original_format = file.substring(file.lastIndexOf("."));

      appActions.emptyProgressBars(index, fileInfo.title);
      ipcRenderer.send("send-convert-file", fileInfo);
    });
  } else {
    if ($startConversion.hasClass("is-converting")) {
      ipcRenderer.send("stop-convert");
      ipcRenderer.on("stop-convert-response", () => {
        ipcRenderer.send("pageloader", "hide-convert-pageloader");
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

ipcRenderer.on("convert-file-progress", (_event, receivedData) => {
  $(`#convert-${receivedData.index}>.is-6>.progress-bar`).val(
    receivedData.percent,
  );
  $(`#convert-${receivedData.index}>.is-2>.percent-progress`).html(
    `${receivedData.percent} %`,
  );
  if (receivedData.fileConverted) {
    conversionCount++;
    appActions.setConvertBadge(
      "start-conversion",
      convertFiles.length,
      conversionCount,
    );
  }

  if (conversionCount === convertFiles.length) {
    appNotifications.exitMessages.conversion = "conversion";
    appNotifications.exitMessages.download = "download";
    ipcRenderer.send("pageloader", "hide-convert-pageloader");
    $convertDivider.attr("data-content", "CONVERT FINISHED!");
    $openConvertFolder.removeProp("disabled").removeAttr("disabled");
    appActions.convertButtonState("static");
    $startConversion.attr("disabled", "true");
  }
});

$(".delete").on("click", () => {
  $convertNotification.css("display", "none");
});

$openConvertedFolder.on("click", () => {
  if (convertFiles) {
    if (convertFiles.length > 0) {
      const p = convertFiles[0].substring(0, convertFiles[0].lastIndexOf("\\"));
      shell.openPath(p);
    }
  } else {
    appErrors.validateAll(
      { no_files_selected: false },
      10000,
      "convert-notification",
    );
  }
});

function setNumberOfConversions(): void {
  if (convertFiles.length > 0) {
    $convertLog.empty();
    $convertProgressFieldsName.html(appActions.progressFieldNames("convert"));
    $startConversion.removeAttr("disabled");
    appActions.setConvertBadge("start-conversion", convertFiles.length);
  } else {
    if (!(conversionCount > 0) && initialFiles && initialFiles.length > 0)
      appActions.setConvertBadge("start-conversion", "remove-badge");
    $startConversion.attr("disabled", "true");
    appErrors.validateAll(
      { no_files_to_convert: false },
      10000,
      "convert-notification",
    );
  }
}

const downloadButton = $("#download-button");
ipcRenderer.on("close-window", (_event, ...args) => {
  const event = args[0] as Electron.IpcRendererEvent | undefined;
  const exitMessages = appNotifications.exitMessages;

  for (const key in exitMessages) {
    if (Object.prototype.hasOwnProperty.call(exitMessages, key)) {
      const val = exitMessages[key as keyof typeof exitMessages];
      if (
        (!val &&
          (downloadButton.hasClass("is-downloading") ||
            downloadButton.hasClass("fetch-data"))) ||
        (!val && $("#start-conversion").hasClass("is-converting"))
      ) {
        ipcRenderer.send("close-window-response", key);
        (appNotifications as any).noProcessActive = null;
        break;
      } else {
        (appNotifications as any).noProcessActive = true;
      }
    }
  }
  if (appNotifications.noProcessActive)
    ipcRenderer.send("close-window-response", "done");
});

ipcRenderer.on("debug", (_event, data) => {
  console.log(data);
});
