import { BrowserWindow } from "electron";
import windowStateKeeper from "electron-window-state";

export let win: BrowserWindow | null = null;

export const createWindow = (): BrowserWindow => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 600,
    defaultHeight: 600,
  });

  win = new BrowserWindow({
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

  mainWindowState.manage(win);

  win.loadURL(`file://${__dirname}/../../renderer/windows/main.html`);

  if (process.argv[2] === "dev") {
    win.webContents.toggleDevTools();
  }

  win.on("closed", () => {
    win = null;
  });

  return win;
};
