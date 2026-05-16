"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const electron_1 = require("electron");
const remote_1 = require("@electron/remote");
const $generalSettings = (0, jquery_1.default)("#general-settings");
const $modal = (0, jquery_1.default)(".modal");
$generalSettings.on("click", () => {
    $modal.addClass("is-active");
});
const $closeMolad = (0, jquery_1.default)(".close-modal");
const $switchSettings = (0, jquery_1.default)("#switch-settings");
$closeMolad.on("click", () => {
    $modal.removeClass("is-active");
    if ($switchSettings.attr("checked")) {
        $switchSettings.prop("checked", false).removeAttr("checked");
        $generalSettingsSection.toggle();
        $settingsMessage.toggle();
    }
});
const logsPath = `${remote_1.app.getPath("userData")}/logs`;
const $openLogs = (0, jquery_1.default)(".open-logs");
$openLogs.on("click", () => {
    electron_1.shell.openPath(logsPath);
});
const $settingsMessage = (0, jquery_1.default)(".settings-message");
const $generalSettingsSection = (0, jquery_1.default)(".general-settings-section");
$switchSettings.on("click", function () {
    $switchSettings.attr("checked")
        ? (0, jquery_1.default)(this).removeAttr("checked")
        : (0, jquery_1.default)(this).attr("checked", "checked");
    $generalSettingsSection.toggle();
    $settingsMessage.toggle();
});
const $navLink = (0, jquery_1.default)(".nav-link");
const $menuSection = (0, jquery_1.default)(".menu-section");
$navLink.on("click", function () {
    $navLink.find("a:first").removeClass("is-active");
    $menuSection.addClass("hide-section");
    (0, jquery_1.default)(this).find("a:first").addClass("is-active");
    const selectedLink = (0, jquery_1.default)(this).attr("id");
    const selectedSection = selectedLink.split("-");
    const sectionId = `${selectedSection[0]}-section`;
    (0, jquery_1.default)(`#${sectionId}`).removeClass("hide-section");
});
//# sourceMappingURL=app-navbar.js.map