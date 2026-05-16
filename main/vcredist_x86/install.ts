// @ts-nocheck
// This file uses the deprecated `node-cmd` package which is not installed.
// It is kept for reference only and is not loaded by the application.

import { dialog, app } from "electron";
import cmd from "node-cmd";
import path from "path";

const isWin = process.platform === "win32";

export const check = (): void => {
  if (isWin) {
    cmd.get(
      "wmic product get name,version /format:csv",
      (err, data, _stderr) => {
        const isVcredistInstalled =
          data.search(/Microsoft Visual C\+\+ 2010  x86/) !== -1;

        if (!isVcredistInstalled) {
          dialog.showMessageBox(
            {
              type: "info",
              title: " Install required",
              message:
                "Microsoft Visual C++ 2010 Redistributable Package (x86) is not installed. Without it the program won't work! Press Install to install it or Quit if you want to leave the program ",
              buttons: ["Install", "Install it later"],
            },
            (buttonIndex) => {
              if (buttonIndex !== 0) {
                console.log("Install it later!!!");
              } else {
                cmd.run(
                  path.resolve(
                    __dirname,
                    "..",
                    "..",
                    "node_modules",
                    "youtube-dl",
                    "bin",
                    "vcredist_x86.exe",
                  ),
                );
              }
            },
          );
        }
      },
    );
  }
};
