"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForUpdates = exports.getYtDlpPath = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const electron_1 = require("electron");
const logger_1 = require("../../utils/logger");
const BIN_DIR = path_1.default.join(electron_1.app.getPath("userData"), "bin");
const YTDLP_PATH = path_1.default.join(BIN_DIR, process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
const YTDLP_RELEASE_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/" +
    (process.platform === "win32"
        ? "yt-dlp.exe"
        : process.platform === "darwin"
            ? "yt-dlp_macos"
            : "yt-dlp");
const getYtDlpPath = () => YTDLP_PATH;
exports.getYtDlpPath = getYtDlpPath;
const downloadBinary = () => new Promise((resolve, reject) => {
    if (!fs_1.default.existsSync(BIN_DIR))
        fs_1.default.mkdirSync(BIN_DIR, { recursive: true });
    const file = fs_1.default.createWriteStream(YTDLP_PATH);
    const followRedirects = (url, depth = 0) => {
        if (depth > 5)
            return reject(new Error("Too many redirects"));
        https_1.default
            .get(url, (res) => {
            if (res.statusCode === 301 ||
                res.statusCode === 302 ||
                res.statusCode === 307 ||
                res.statusCode === 308) {
                return followRedirects(res.headers.location, depth + 1);
            }
            if (res.statusCode !== 200)
                return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
            res.pipe(file);
            file.on("finish", () => {
                file.close();
                if (process.platform !== "win32") {
                    fs_1.default.chmodSync(YTDLP_PATH, 0o755);
                }
                resolve();
            });
        })
            .on("error", (err) => {
            fs_1.default.unlink(YTDLP_PATH, () => { });
            reject(err);
        });
    };
    followRedirects(YTDLP_RELEASE_URL);
});
const checkForUpdates = (event) => {
    const firstRun = !fs_1.default.existsSync(YTDLP_PATH);
    if (firstRun) {
        (0, logger_1.logger)("yt-dlp not found, downloading...");
        event.sender.send("update-ytdl");
        downloadBinary()
            .then(() => {
            (0, logger_1.logger)("yt-dlp downloaded successfully.");
            event.sender.send("ytdl-update-finished");
        })
            .catch((err) => {
            (0, logger_1.logger)(`yt-dlp download error: ${err}`);
            event.sender.send("ytdl-update-finished");
        });
        return;
    }
    const { spawn } = require("child_process");
    const ytdlProcess = spawn(YTDLP_PATH, ["-U"], { detached: false });
    ytdlProcess.stdout.on("data", (ytdlOutput) => {
        const out = ytdlOutput.toString();
        (0, logger_1.logger)(out);
        if (out.includes("Updating"))
            event.sender.send("update-ytdl");
        if (out.includes("Updated") || out.includes("up to date"))
            event.sender.send("ytdl-update-finished");
    });
    ytdlProcess.stderr.on("data", (ytdlError) => {
        (0, logger_1.logger)(ytdlError.toString());
        event.sender.send("ytdl-update-finished");
    });
    ytdlProcess.on("exit", (code) => {
        (0, logger_1.logger)(`yt-dlp updater exit code: ${code}`);
        event.sender.send("ytdl-update-finished");
    });
    ytdlProcess.on("error", (err) => {
        (0, logger_1.logger)(`yt-dlp spawn error: ${err}`);
        event.sender.send("ytdl-update-finished");
    });
};
exports.checkForUpdates = checkForUpdates;
//# sourceMappingURL=ytdl-updater.js.map