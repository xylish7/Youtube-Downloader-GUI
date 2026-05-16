import $ from "jquery";
import Store from "./store";
import { downloadInfo } from "./app/app-actions";

const store = new Store({
  configName: "user-preferences",
  defaults: {},
});

const messagePath = $("#path-message");
const articlePath = $("#path-article");
const savePath = store.get("savePath") as string | undefined;
if (savePath) {
  messagePath.html(`<i> ${savePath}</i>`);
  articlePath.show();
  downloadInfo.savePath = savePath;
}

const $settingsOptions = $(".settings-options");

$settingsOptions.on("change", function () {
  const storeId = ($(this).attr("id") as string)
    .replace("-option", "")
    .replace("-", "_");
  store.set(storeId, $(this).val());
});

$settingsOptions.each(function () {
  let storeId = ($(this).attr("id") as string)
    .replace("-option", "")
    .replace("-", "_");
  const storedVal = store.get(storeId);
  if (storedVal) {
    $(this).find("option:selected").removeAttr("selected");
    $(this).find(`option[value="${storedVal}"]`).attr("selected", "selected");
  }
});
