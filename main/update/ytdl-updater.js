const path = require("path");
const fs = require("fs");
const https = require("https");
const { app } = require("electron");
const { logger } = require("../../utils/logger");

const BIN_DIR = path.join(app.getPath("userData"), "bin");
const YTDLP_PATH = path.join(
  BIN_DIR,
  process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
);
const YTDLP_RELEASE_URL =
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/" +
  (process.platform === "win32"
    ? "yt-dlp.exe"
    : process.platform === "darwin"
      ? "yt-dlp_macos"
      : "yt-dlp");

// Returns the path to the yt-dlp binary (used by download-playlist.js)
const getYtDlpPath = () => YTDLP_PATH;

// Download the yt-dlp binary from GitHub Releases
const downloadBinary = () =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

    const file = fs.createWriteStream(YTDLP_PATH);

    const followRedirects = (url, depth = 0) => {
      if (depth > 5) return reject(new Error("Too many redirects"));
      https
        .get(url, (res) => {
          if (
            res.statusCode === 301 ||
            res.statusCode === 302 ||
            res.statusCode === 307 ||
            res.statusCode === 308
          ) {
            return followRedirects(res.headers.location, depth + 1);
          }
          if (res.statusCode !== 200)
            return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            // Make executable on Unix
            if (process.platform !== "win32") {
              fs.chmodSync(YTDLP_PATH, 0o755);
            }
            resolve();
          });
        })
        .on("error", (err) => {
          fs.unlink(YTDLP_PATH, () => {});
          reject(err);
        });
    };

    followRedirects(YTDLP_RELEASE_URL);
  });

// Check for yt-dlp updates (or download on first run)
const checkForUpdates = (event) => {
  const firstRun = !fs.existsSync(YTDLP_PATH);

  if (firstRun) {
    logger("yt-dlp not found, downloading...");
    event.sender.send("update-ytdl");
    downloadBinary()
      .then(() => {
        logger("yt-dlp downloaded successfully.");
        event.sender.send("ytdl-update-finished");
      })
      .catch((err) => {
        logger(`yt-dlp download error: ${err}`);
        event.sender.send("ytdl-update-finished");
      });
    return;
  }

  // Binary exists — run yt-dlp -U to self-update
  const spawn = require("child_process").spawn;
  const ytdlProcess = spawn(YTDLP_PATH, ["-U"], { detached: false });

  ytdlProcess.stdout.on("data", (ytdlOutput) => {
    const out = ytdlOutput.toString();
    logger(out);
    if (out.includes("Updating")) event.sender.send("update-ytdl");
    if (out.includes("Updated") || out.includes("up to date"))
      event.sender.send("ytdl-update-finished");
  });

  ytdlProcess.stderr.on("data", (ytdlError) => {
    logger(ytdlError.toString());
    event.sender.send("ytdl-update-finished");
  });

  ytdlProcess.on("exit", (code) => {
    logger(`yt-dlp updater exit code: ${code}`);
    event.sender.send("ytdl-update-finished");
  });

  ytdlProcess.on("error", (err) => {
    logger(`yt-dlp spawn error: ${err}`);
    event.sender.send("ytdl-update-finished");
  });
};

module.exports = { checkForUpdates, getYtDlpPath };
