"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killAllProcesses = exports.resetValues = exports.options = exports.messages = exports.noProcessActive = exports.exitMessages = void 0;
exports.exitMessages = {
    download: null,
    conversion: null,
};
exports.noProcessActive = null;
exports.messages = {
    download: "Download in progress. Are you sure you want to quit?",
    conversion: "Conversion in progress. Are you sure you want to quit?",
};
exports.options = {
    type: "question",
    buttons: ["Yes", "No"],
    title: "Confirm",
    message: "",
};
const resetValues = () => {
    exports.exitMessages.download = null;
    exports.exitMessages.conversion = null;
    exports.noProcessActive = null;
};
exports.resetValues = resetValues;
const killAllProcesses = (callback) => {
    if (callback && typeof callback === "function")
        callback();
};
exports.killAllProcesses = killAllProcesses;
//# sourceMappingURL=app-notifications.js.map