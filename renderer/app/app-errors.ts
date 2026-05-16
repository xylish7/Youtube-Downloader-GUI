import $ from "jquery";
import fs from "fs";

export const messages: Record<string, string> = {
  save_folder_selected: "Please select the Save Folder!",
  path_not_exist: "The selected Save Folder does not exists!",
  url: "The provided URL is not valid!",
  ytdl_error: "Unsupported URL! / Connection timeout!",
  large_playlist: "For large playlist, fetching data time is 1-2 min!",
  no_files_to_convert: "Files already have the desired format!",
  no_files_selected:
    "Please, first of all, select the files you want to convert.",
  files_removed: "Some files were removed because they had the desired format.",
};

export let notificationTime: ReturnType<typeof setTimeout> | undefined;

export const validateSaveFolder = (): boolean => {
  const articlePath = $("#path-article");
  return articlePath.css("display") !== "none";
};

export const validatePath = (path: string): boolean => fs.existsSync(path);

export const validateURL = (): boolean => {
  const inputUrl = $("#input-url");
  const expression =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/g;
  const urlRegex = new RegExp(expression);
  return !!inputUrl.val()?.toString().match(urlRegex);
};

export const showError = (
  message: string,
  duration: number,
  notificationPanel = "download-notification",
): void => {
  const notification = $(`.${notificationPanel}`);
  const notificationMessage = $(`.${notificationPanel}>.notification-message`);

  notificationMessage.html(message);
  notification.slideDown(250);

  notificationTime = setTimeout(() => {
    notification.fadeOut(900);
  }, duration);
};

export const validateAll = (
  validationResults: Record<string, boolean>,
  duration: number,
  notificationPanel = "download-notification",
): boolean => {
  if (notificationTime) clearTimeout(notificationTime);
  for (const key in validationResults) {
    if (Object.prototype.hasOwnProperty.call(validationResults, key)) {
      if (!validationResults[key]) {
        showError(messages[key], duration, notificationPanel);
        return false;
      }
    }
  }
  return true;
};

export let largePlaylistTime: ReturnType<typeof setTimeout> | undefined;

export const largePlaylist = (condition = false): void => {
  const notification = $(".notification");

  if (condition) {
    notification.fadeOut(900);
    clearTimeout(largePlaylistTime);
  } else {
    largePlaylistTime = setTimeout(() => {
      showError(messages["large_playlist"], 50000);
    }, 10000);
  }
};
