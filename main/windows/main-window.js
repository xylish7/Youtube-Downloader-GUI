const { BrowserWindow } = require("electron");
const windowStateKeeper = require("electron-window-state");

exports.win;

// mainWindow createWindow fn
exports.createWindow = () => {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 600,
    defaultHeight: 600
  });

  this.win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    resizable: false,
    title: "Youtube-downloader"
  });

  // Open the window at the position it was closed
  mainWindowState.manage(this.win);

  // Load main window content
  this.win.loadURL(`file://${__dirname}/../../renderer/windows/main.html`);

  // Toggle developer tools
  if (process.argv[2] == "dev") {
    this.win.toggleDevTools();
  }

  // Handle window closed
  this.win.on("closed", () => {
    this.win = null;
  });

  // Return window object
  return this.win;
};
