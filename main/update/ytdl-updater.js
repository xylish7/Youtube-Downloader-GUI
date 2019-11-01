var path = require("path");
var spawn = require("cross-spawn-async");
const { logger } = require("../../utils/logger");

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
    logger(ytdlOutput);

    if (ytdlOutput.toString().includes("Updating"))
      event.sender.send("update-ytdl");
    if (ytdlOutput.toString().includes("Updated"))
      event.sender.send("ytdl-update-finished");
    if (ytdlOutput.toString().includes("Waiting for file"))
      event.sender.send("ytdl-update-finished");
  });

  ytdlProcess.stderr.on("data", ytdlError => {
    logger(ytdlError);

    event.sender.send("ytdl-update-finished");
  });

  ytdlProcess.on("exit", code => {
    logger(`yt-dl updater exit code: ${code}`);

    event.sender.send("ytdl-update-finished");
  });
};

module.exports = { checkForUpdates };
