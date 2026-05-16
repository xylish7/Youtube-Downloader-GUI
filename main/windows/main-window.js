"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindow = exports.win = void 0;
const electron_1 = require("electron");
const electron_window_state_1 = __importDefault(require("electron-window-state"));
exports.win = null;
const createWindow = () => {
    const mainWindowState = (0, electron_window_state_1.default)({
        defaultWidth: 600,
        defaultHeight: 600,
    });
    exports.win = new electron_1.BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        resizable: false,
        title: "Youtube-downloader",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindowState.manage(exports.win);
    exports.win.loadURL(`file://${__dirname}/../../renderer/windows/main.html`);
    if (process.argv[2] === "dev") {
        exports.win.webContents.toggleDevTools();
    }
    exports.win.on("closed", () => {
        exports.win = null;
    });
    return exports.win;
};
exports.createWindow = createWindow;
//# sourceMappingURL=main-window.js.map