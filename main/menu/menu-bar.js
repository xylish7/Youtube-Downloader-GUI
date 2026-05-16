"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMenu = void 0;
const electron_1 = require("electron");
const template = [
    {
        role: "window",
        submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "delete" },
            { role: "selectAll" },
        ],
    },
    {
        role: "help",
        submenu: [
            {
                label: "About",
                click() {
                    require("electron").shell.openExternal("https://github.com/xylish7/Youtube-Download-Convert-Cut");
                },
            },
        ],
    },
];
if (process.platform === "darwin") {
    template.unshift({
        label: electron_1.app.getName(),
        submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services", submenu: [] },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
        ],
    });
    // Edit menu
    template[1].submenu.push({ type: "separator" }, {
        label: "Speech",
        submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
    });
    // Window menu
    template[3].submenu = [
        { role: "close" },
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
    ];
}
const menu = electron_1.Menu.buildFromTemplate(template);
electron_1.Menu.setApplicationMenu(menu);
const contextTemplate = [
    { role: "cut" },
    { role: "copy" },
    { role: "paste" },
    { role: "delete" },
    { role: "selectall" },
];
exports.contextMenu = electron_1.Menu.buildFromTemplate(contextTemplate);
//# sourceMappingURL=menu-bar.js.map