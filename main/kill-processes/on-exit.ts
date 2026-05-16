import { dialog, app } from "electron";
import * as appNotification from "./app-notifications";
import * as dlPlaylist from "../ytdl/download-playlist";
import { BrowserWindow } from "electron";

export const confirmExit = (
  windowObject: BrowserWindow,
  messageKey: string,
): void => {
  if (messageKey === "done") {
    windowObject.destroy();
  } else {
    appNotification.options.message =
      appNotification.messages[
        messageKey as keyof typeof appNotification.messages
      ];

    dialog
      .showMessageBox(appNotification.options)
      .then(({ response: index }) => {
        if (index === 0) {
          windowObject.hide();
          dlPlaylist.stopOnClose();
          appNotification.killAllProcesses(() => {
            windowObject.destroy();
            app.quit();
          });
        }
      });
  }
};
