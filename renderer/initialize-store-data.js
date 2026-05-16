"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const store_1 = __importDefault(require("./store"));
const app_actions_1 = require("./app/app-actions");
const store = new store_1.default({
    configName: "user-preferences",
    defaults: {},
});
const messagePath = (0, jquery_1.default)("#path-message");
const articlePath = (0, jquery_1.default)("#path-article");
const savePath = store.get("savePath");
if (savePath) {
    messagePath.html(`<i> ${savePath}</i>`);
    articlePath.show();
    app_actions_1.downloadInfo.savePath = savePath;
}
const $settingsOptions = (0, jquery_1.default)(".settings-options");
$settingsOptions.on("change", function () {
    const storeId = (0, jquery_1.default)(this).attr("id")
        .replace("-option", "")
        .replace("-", "_");
    store.set(storeId, (0, jquery_1.default)(this).val());
});
$settingsOptions.each(function () {
    let storeId = (0, jquery_1.default)(this).attr("id")
        .replace("-option", "")
        .replace("-", "_");
    const storedVal = store.get(storeId);
    if (storedVal) {
        (0, jquery_1.default)(this).find("option:selected").removeAttr("selected");
        (0, jquery_1.default)(this).find(`option[value="${storedVal}"]`).attr("selected", "selected");
    }
});
//# sourceMappingURL=initialize-store-data.js.map