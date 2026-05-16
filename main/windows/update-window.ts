import { BrowserWindow } from "electron";

export let win: BrowserWindow | null = null;

export const createWindow = (): BrowserWindow => {
  win = new BrowserWindow({
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

  win.loadURL(`file://${__dirname}/../../renderer/windows/update.html`);

  win.on("closed", () => {
    win = null;
  });

  return win;
};
