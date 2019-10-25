var fs = require("fs");
var path = require("path");
var spawn = require("cross-spawn-async");

const ytdlProcessMetadata = {
  ytdl_path: path.resolve(
    __dirname,
    "..",
    "..",
    "node_modules",
    "youtube-dl",
    "bin",
    "youtube-dl.exe"
  ),
  args: ["-U"],
  options: {
    detached: false
  }
};

const checkForUpdates = event => {
  const { ytdl_path, args, options } = ytdlProcessMetadata;

  const ytdlProcess = spawn(ytdl_path, args, options);

  ytdlProcess.stdout.on("data", ytdlOutput => {
    if (ytdlOutput.toString().includes("Updating"))
      event.sender.send("update-ytdl");
  });

  ytdlProcess.on("exit", () => {
    event.sender.send("ytdl-update-finished");
  });
};

module.exports = { checkForUpdates };
