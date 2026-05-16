import $ from "jquery";
import { shell } from "electron";
import { app } from "@electron/remote";

const $generalSettings = $("#general-settings");
const $modal = $(".modal");

$generalSettings.on("click", () => {
  $modal.addClass("is-active");
});

const $closeMolad = $(".close-modal");
const $switchSettings = $("#switch-settings");
$closeMolad.on("click", () => {
  $modal.removeClass("is-active");

  if ($switchSettings.attr("checked")) {
    $switchSettings.prop("checked", false).removeAttr("checked");
    $generalSettingsSection.toggle();
    $settingsMessage.toggle();
  }
});

const logsPath = `${app.getPath("userData")}/logs`;

const $openLogs = $(".open-logs");
$openLogs.on("click", () => {
  shell.openPath(logsPath);
});

const $settingsMessage = $(".settings-message");
const $generalSettingsSection = $(".general-settings-section");
$switchSettings.on("click", function () {
  $switchSettings.attr("checked")
    ? $(this).removeAttr("checked")
    : $(this).attr("checked", "checked");
  $generalSettingsSection.toggle();
  $settingsMessage.toggle();
});

const $navLink = $(".nav-link");
const $menuSection = $(".menu-section");
$navLink.on("click", function () {
  $navLink.find("a:first").removeClass("is-active");
  $menuSection.addClass("hide-section");

  $(this).find("a:first").addClass("is-active");

  const selectedLink = $(this).attr("id") as string;
  const selectedSection = selectedLink.split("-");
  const sectionId = `${selectedSection[0]}-section`;
  $(`#${sectionId}`).removeClass("hide-section");
});
