// Modules
const { dialog } = require("electron").remote;
const { shell } = require("electron");

// Internal modules
const Store = require("../store");

// create persistent variable
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: "user-preferences",
  defaults: {}
});

// --------------------------- Download -------------------- //

// Informations regarding the download
exports.downloadInfo = {
  mp3Conversion: null,
  keepFilesCheckbox: null,
  url: null,
  savePath: null,
  downloadFinished: false
};

// Iformations regarding the conversion
exports.conversionInfo = {
  conversionFinished: false
};

// Get the path where to save the videos
exports.getDownloadPath = () => {
  const messagePath = $("#path-message");
  const articlePath = $("#path-article");
  const inputUrl = $("#input-url");
  const downloadButton = $("#download-button");

  var savePath = dialog.showOpenDialog({
    properties: ["openDirectory"]
  });

  if (savePath) {
    // Store savePath
    store.set("savePath", savePath[0]);

    // Show path
    messagePath.html(`<i>${savePath[0]}</i>`);
    articlePath.show();

    // If input has value enable it
    if (inputUrl.val() != "") {
      downloadButton.removeAttr("disabled");
    }

    this.downloadInfo.savePath = savePath[0];
  }
};

// Open 'Save Folder' in explorer
exports.openSavePath = () => {
  const pathFolder = $("#open-download-explorer");
  const messagePath = $("#path-message");
  pathFolder.on("click", function() {
    let path = messagePath
      .text()
      .replace("Save Path: ", "")
      .trim();
    shell.openItem(path);
  });
};

// Get all values from inputs, checkboxes, selects etc.
exports.getFieldValues = () => {
  const mp3Conversion = $("#mp3-conversion");
  const keepFilesCheckbox = $("#keep-files");
  const inputUrl = $("#input-url");
  const settingsOptions = $(".settings-options");

  this.downloadInfo.mp3Conversion = mp3Conversion.is(":checked")
    ? mp3Conversion.val()
    : "false";
  this.downloadInfo.keepFilesCheckbox = keepFilesCheckbox.is(":checked")
    ? keepFilesCheckbox.val()
    : "false";
  // Check if it's playlist
  const url = inputUrl.val();
  if (url.search("list") > 0)
    this.downloadInfo.url = url.replace(/(v=[^&]*&)/, "");
  else this.downloadInfo.url = url;

  // Get general settings values
  var downloadInfoCopy = this.downloadInfo;
  settingsOptions.each(function() {
    let id = $(this)
      .attr("id")
      .replace("-option", "")
      .replace("-", "_");
    downloadInfoCopy[id] = $(this).val();
  });
  this.downloadInfo = downloadInfoCopy;
};

// Add  dynamicaly progress bar for every video
exports.dynamicContent = (data, caseName) => {
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
      break;
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
      break;
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
      break;
  }
};

// Name every filed from progress log
exports.progressFieldNames = caseName => {
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
      break;
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
      break;
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
      break;
  }
};

// Update progress bar, and percent value
exports.showProgress = data => {
  const downloadLog = $(".download-log");
  const progressBar = ".progress-bar";
  const videoTitle = ".video-title";
  const percentProgress = ".percent-progress";

  // Fill progress bar
  downloadLog
    .find(progressBar)
    .last()
    .val(data.percent);
  // Show the procent in clear text
  downloadLog
    .find(percentProgress)
    .last()
    .html(`${data.percent}%`);
  // Show the title of the video
  downloadLog
    .find(videoTitle)
    .last()
    .html(`${data.title}`);
};

// Disable download button if no input or save path is provided
exports.disableButton = () => {
  const articlePath = $("#path-article");
  const inputUrl = $("#input-url");
  const downloadButton = $("#download-button");

  if (articlePath.css("display") != "none" && inputUrl.val() != "")
    downloadButton.removeAttr("disabled");
  else downloadButton.attr("disabled", true);
};

// Change the state of the Download button
exports.buttonState = state => {
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
      inputUrl.attr("disabled", true);
      buttonMessage.html("Fetching data...");
      buttonIcon.removeClass("fa fa-download").addClass("fas fa-sync fa-spin");
      break;

    case "downloading":
      downloadButton.addClass("is-downloading").removeClass("fetch-data");
      inputUrl.attr("disabled", true);
      buttonMessage.html("Stop-download!");
      buttonIcon
        .removeClass("fas fa-sync fa-spin")
        .addClass("fas fa-spinner fa-pulse");
      break;
  }
};

// ---------------- Convert ---------------- //

// Get paths for every file
exports.getConvertFiles = filter => {
  let convertFiles = dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [filter]
  });

  return convertFiles;
};

// Append all empty progress bar with title
exports.emptyProgressBars = (index, title) => {
  const $convertLog = $(".convert-log");
  const videoTitle = ".video-title";
  const percentProgress = ".percent-progress";
  const progressBar = ".progress-bar ";

  $convertLog.append(
    `${this.dynamicContent(`convert-${index + 1}`, "convert")}`
  );
  $convertLog
    .find(videoTitle)
    .last()
    .html(`${title}`);
  $convertLog
    .find(percentProgress)
    .last()
    .html("0%");
  $convertLog
    .find(progressBar)
    .last()
    .val("0");
};
// Get options for conversion
exports.getConvertOptions = () => {
  var $deleteFiles = $("#delete-convert-files");
  $deleteFiles = $deleteFiles.is(":checked") ? $deleteFiles.val() : "false";

  const $convertAudioRadio = $("#convert-audio-radio");
  var audio_or_video_format =
    $convertAudioRadio.attr("checked") == "checked"
      ? $("#convert-audio-format-option").val()
      : $("#convert-video-format-option").val();

  return {
    audio_or_video_format,
    audio_quality: $("#convert-audio-quality-option").val(),
    no_processes: $("#convert-no-processes-option").val(),
    delete_files: $deleteFiles
  };
};

// Get save path
exports.getConvertPath = pathWithTitle => {
  return pathWithTitle.substring(0, pathWithTitle.lastIndexOf("\\"));
};

exports.setConvertBadge = (id, lastNumber, firstNumber = 0) => {
  if (lastNumber == "remove-badge") {
    $(`#${id}`).removeAttr("data-badge");
  } else $(`#${id}`).attr("data-badge", `${firstNumber}/${lastNumber}`);
};

// Change the state of the Download button
exports.convertButtonState = state => {
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

// Remove files that have the convert format same as original format
exports.removeSameFormat = converFilesArray => {
  const $convertAudioRadio = $("#convert-audio-radio");
  var audio_or_video_format =
    $convertAudioRadio.attr("checked") == "checked"
      ? $("#convert-audio-format-option").val()
      : $("#convert-video-format-option").val();

  const filteredFiles = converFilesArray.filter(
    file => file.substring(file.lastIndexOf(".")) != `.${audio_or_video_format}`
  );
  return filteredFiles;
};
