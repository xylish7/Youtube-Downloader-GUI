// Modules
const path = require("path");
const { spawn } = require("child_process");
const { ipcMain } = require("electron");

// Internal modules
const mp3converter = require("../conversion/mp3Converter");
const { killAllProcesses } = require("../kill-processes/app-notifications");
const { logger } = require("../../utils/logger");
const { getYtDlpPath } = require("../update/ytdl-updater");

exports.staticInfo = {
  win: false,
  informationExtracted: false,
  downloadFinished: false,
  appendColumns: true,
  isPlaylist: false,
  keepFiles: false,
};

exports.ipcEvent = {};

var subprocess = null;

exports.playlist = (url) => {
  var dynamicInfo = {};
  var staticInfo = exports.staticInfo;
  var ipcEvent = exports.ipcEvent;
  const { downloadInfo } = ipcEvent;

  const outputTemplate = path.join(downloadInfo.savePath, "%(title)s.%(ext)s");

  const args = [
    url,
    "--output",
    outputTemplate,
    "--format",
    `bestvideo[ext=${downloadInfo.video_format}]+bestaudio/best[ext=${downloadInfo.video_format}]/best`,
    "--newline",
    "--no-check-certificates",
    "--no-warnings",
    "--prefer-free-formats",
  ];

  subprocess = spawn(getYtDlpPath(), args, { detached: false });

  // --- stdout: progress lines from yt-dlp ---
  subprocess.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      // Detect total playlist size: "[download] Downloading item X of N"
      const playlistSizeMatch = line.match(
        /\[download\] Downloading item \d+ of (\d+)/,
      );
      if (playlistSizeMatch && !staticInfo.informationExtracted) {
        staticInfo.informationExtracted = true;
        staticInfo.n_entries = parseInt(playlistSizeMatch[1], 10);
        staticInfo.isPlaylist = true;
      }

      // Detect current playlist item index
      const playlistItemMatch = line.match(
        /\[download\] Downloading item (\d+) of \d+/,
      );
      if (playlistItemMatch) {
        dynamicInfo.playlist_index = parseInt(playlistItemMatch[1], 10);
        staticInfo.appendColumns = true;
      }

      // Detect destination file (gives us the title)
      const destMatch = line.match(/\[download\] Destination: (.+)/);
      if (destMatch) {
        const filePath = destMatch[1].trim();
        const basename = path.basename(filePath);
        dynamicInfo.title = basename.substring(0, basename.lastIndexOf("."));
        dynamicInfo.filePath = filePath;

        // For single video, set playlist_index to 1
        if (dynamicInfo.playlist_index == null) {
          dynamicInfo.playlist_index = 1;
          if (!staticInfo.informationExtracted) {
            staticInfo.n_entries = 1;
            staticInfo.isPlaylist = null; // null = single video
          }
        }

        if (staticInfo.appendColumns) {
          ipcEvent.event.sender.send("playlist-progress", {
            static: {
              ...staticInfo,
              appendColumns: true,
              downloadFinished: false,
            },
            dynamic: { ...dynamicInfo, percent: "0.00" },
          });
          staticInfo.appendColumns = false;
        }
      }

      // Detect download progress: "[download]  52.3% of    5.00MiB at ..."
      const progressMatch = line.match(/\[download\]\s+([\d.]+)%/);
      if (progressMatch) {
        dynamicInfo.percent = parseFloat(progressMatch[1]).toFixed(2);
        ipcEvent.event.sender.send("playlist-progress", {
          static: {
            ...staticInfo,
            appendColumns: false,
            downloadFinished: false,
          },
          dynamic: { ...dynamicInfo },
        });
      }

      // Detect already-downloaded
      if (
        line.includes("[download]") &&
        line.includes("has already been downloaded")
      ) {
        dynamicInfo.percent = "100.00";
        ipcEvent.event.sender.send("playlist-progress", {
          static: {
            ...staticInfo,
            appendColumns: false,
            downloadFinished: false,
          },
          dynamic: { ...dynamicInfo },
        });
      }
    });
  });

  subprocess.stderr.on("data", (data) => {
    logger(data.toString());
  });

  subprocess.on("close", (code) => {
    subprocess = null;
    if (!exports.staticInfo.downloadFinished) {
      staticInfo.downloadFinished = true;
      exports.staticInfo.downloadFinished = true;

      ipcEvent.event.sender.send("playlist-progress", {
        static: { ...staticInfo, downloadFinished: true },
        dynamic: { ...dynamicInfo, percent: "100.00" },
      });

      // Trigger conversion if mp3 was selected
      if (downloadInfo.mp3Conversion === "true") {
        staticInfo.keepFiles = downloadInfo.keepFilesCheckbox;
        mp3converter.convertVideo(
          { static: staticInfo, dynamic: dynamicInfo },
          downloadInfo,
        );
      }
    }
  });

  subprocess.on("error", (err) => {
    logger(err.toString());
    ipcEvent.event.sender.send("ytdl-errors", err.toString());
  });
};

ipcMain.on("stop-download", (event) => {
  if (subprocess) {
    subprocess.kill("SIGKILL");
    subprocess = null;
  }
  killAllProcesses();
  exports.staticInfo.appendColumns = true;
  exports.staticInfo.downloadFinished = false;
  exports.staticInfo.informationExtracted = false;
  event.sender.send("response");
});

exports.stopOnClose = () => {
  if (subprocess) {
    subprocess.kill("SIGKILL");
    subprocess = null;
  }
};
