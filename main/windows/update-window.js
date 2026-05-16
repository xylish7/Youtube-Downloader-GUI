"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindow = exports.win = void 0;
const electron_1 = require("electron");
exports.win = null;
const createWindow = () => {
    exports.win = new electron_1.BrowserWindow({
        width: 500,
        height: 133,
        useContentSize: true,
        autoHideMenuBar: true,
        maximizable: false,
        fullscreen: false,
        fullscreenable: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    exports.win.loadURL(`file://${__dirname}/../../renderer/windows/update.html`);
    exports.win.on("closed", () => {
        exports.win = null;
    });
    return exports.win;
};
exports.createWindow = createWindow;
//# sourceMappingURL=update-window.js.map