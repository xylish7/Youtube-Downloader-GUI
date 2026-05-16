"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.largePlaylist = exports.largePlaylistTime = exports.validateAll = exports.showError = exports.validateURL = exports.validatePath = exports.validateSaveFolder = exports.notificationTime = exports.messages = void 0;
const jquery_1 = __importDefault(require("jquery"));
const fs_1 = __importDefault(require("fs"));
exports.messages = {
    save_folder_selected: "Please select the Save Folder!",
    path_not_exist: "The selected Save Folder does not exists!",
    url: "The provided URL is not valid!",
    ytdl_error: "Unsupported URL! / Connection timeout!",
    large_playlist: "For large playlist, fetching data time is 1-2 min!",
    no_files_to_convert: "Files already have the desired format!",
    no_files_selected: "Please, first of all, select the files you want to convert.",
    files_removed: "Some files were removed because they had the desired format.",
};
const validateSaveFolder = () => {
    const articlePath = (0, jquery_1.default)("#path-article");
    return articlePath.css("display") !== "none";
};
exports.validateSaveFolder = validateSaveFolder;
const validatePath = (path) => fs_1.default.existsSync(path);
exports.validatePath = validatePath;
const validateURL = () => {
    const inputUrl = (0, jquery_1.default)("#input-url");
    const expression = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/g;
    const urlRegex = new RegExp(expression);
    return !!inputUrl.val()?.toString().match(urlRegex);
};
exports.validateURL = validateURL;
const showError = (message, duration, notificationPanel = "download-notification") => {
    const notification = (0, jquery_1.default)(`.${notificationPanel}`);
    const notificationMessage = (0, jquery_1.default)(`.${notificationPanel}>.notification-message`);
    notificationMessage.html(message);
    notification.slideDown(250);
    exports.notificationTime = setTimeout(() => {
        notification.fadeOut(900);
    }, duration);
};
exports.showError = showError;
const validateAll = (validationResults, duration, notificationPanel = "download-notification") => {
    if (exports.notificationTime)
        clearTimeout(exports.notificationTime);
    for (const key in validationResults) {
        if (Object.prototype.hasOwnProperty.call(validationResults, key)) {
            if (!validationResults[key]) {
                (0, exports.showError)(exports.messages[key], duration, notificationPanel);
                return false;
            }
        }
    }
    return true;
};
exports.validateAll = validateAll;
const largePlaylist = (condition = false) => {
    const notification = (0, jquery_1.default)(".notification");
    if (condition) {
        notification.fadeOut(900);
        clearTimeout(exports.largePlaylistTime);
    }
    else {
        exports.largePlaylistTime = setTimeout(() => {
            (0, exports.showError)(exports.messages["large_playlist"], 50000);
        }, 10000);
    }
};
exports.largePlaylist = largePlaylist;
//# sourceMappingURL=app-errors.js.map