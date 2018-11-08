// Modules
const { dialog, app } = require("electron");
const cmd = require("node-cmd");

// Check to see if Microsoft Visual C++ 2010 Redistributable Package (x86) is installed
const isWin = process.platform === "win32";
exports.check = () => {
  if (isWin) {
    // Get all installed programs
    cmd.get(
      "wmic product get name,version /format:csv",
      (err, data, stderr) => {
        // Check if Microsoft Visual C++ 2010 Redistributable Package (x86)
        const isVcredistInstalled =
          data.search(/Microsoft Visual C\+\+ 2010  x86/) !== -1;

        if (!isVcredistInstalled) {
          // Prompt user to update
          dialog.showMessageBox(
            {
              type: "info",
              title: " Install required",
              message:
                "Microsoft Visual C++ 2010 Redistributable Package (x86) is not installed. Without it the program won't work! Press Install to install it or Quit if you want to leave the program ",
              buttons: ["Install", "Quit"]
            },
            buttonIndex => {
              // If 'Quit' button is pressed, return false
              if (buttonIndex !== 0) app.quit();

              // Install Microsoft Visual C++ 2010 Redistributable Package (x86)
              cmd.run(`${__dirname}\\vcredist_x86.exe`);
            }
          );
        }
      }
    );
  }
};
