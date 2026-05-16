"use strict";
// @ts-nocheck
// This file uses the deprecated `node-cmd` package which is not installed.
// It is kept for reference only and is not loaded by the application.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check = void 0;
const electron_1 = require("electron");
const node_cmd_1 = __importDefault(require("node-cmd"));
const path_1 = __importDefault(require("path"));
const isWin = process.platform === "win32";
const check = () => {
    if (isWin) {
        node_cmd_1.default.get("wmic product get name,version /format:csv", (err, data, _stderr) => {
            const isVcredistInstalled = data.search(/Microsoft Visual C\+\+ 2010  x86/) !== -1;
            if (!isVcredistInstalled) {
                electron_1.dialog.showMessageBox({
                    type: "info",
                    title: " Install required",
                    message: "Microsoft Visual C++ 2010 Redistributable Package (x86) is not installed. Without it the program won't work! Press Install to install it or Quit if you want to leave the program ",
                    buttons: ["Install", "Install it later"],
                }, (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        console.log("Install it later!!!");
                    }
                    else {
                        node_cmd_1.default.run(path_1.default.resolve(__dirname, "..", "..", "node_modules", "youtube-dl", "bin", "vcredist_x86.exe"));
                    }
                });
            }
        });
    }
};
exports.check = check;
//# sourceMappingURL=install.js.map