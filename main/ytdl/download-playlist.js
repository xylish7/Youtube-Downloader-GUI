"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopOnClose = exports.playlist = exports.ipcEvent = exports.staticInfo = void 0;
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const electron_1 = require("electron");
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const app_notifications_1 = require("../kill-processes/app-notifications");
const logger_1 = require("../../utils/logger");
const ytdl_updater_1 = require("../update/ytdl-updater");
exports.staticInfo = {
    win: false,
    informationExtracted: false,
    downloadFinished: false,
    appendColumns: true,
    isPlaylist: false,
};
exports.ipcEvent = {};
let subprocess = null;
const playlist = (url) => {
    const dynamicInfo = {};
    const si = exports.staticInfo;
    const ie = exports.ipcEvent;
    const { downloadInfo } = ie;
    const serializableSI = (overrides = {}) => {
        const { win, ...rest } = si;
        return { ...rest, ...overrides };
    };
    const outputTemplate = path_1.default.join(downloadInfo.savePath, "%(title)s.%(ext)s");
    const args = [
        url,
        "--output",
        outputTemplate,
        "-x",
        "--audio-format",
        downloadInfo.audio_format,
        "--audio-quality",
        downloadInfo.audio_quality,
        "--ffmpeg-location",
        ffmpeg_static_1.default,
        "--newline",
        "--no-check-certificates",
        "--no-warnings",
    ];
    subprocess = (0, child_process_1.spawn)((0, ytdl_updater_1.getYtDlpPath)(), args, { detached: false });
    subprocess.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line) => {
            line = line.trim();
            if (!line)
                return;
            const playlistSizeMatch = line.match(/\[download\] Downloading item \d+ of (\d+)/);
            if (playlistSizeMatch && !si.informationExtracted) {
                si.informationExtracted = true;
                si.n_entries = parseInt(playlistSizeMatch[1], 10);
                si.isPlaylist = true;
            }
            const playlistItemMatch = line.match(/\[download\] Downloading item (\d+) of \d+/);
            if (playlistItemMatch) {
                dynamicInfo.playlist_index = parseInt(playlistItemMatch[1], 10);
                si.appendColumns = true;
            }
            const destMatch = line.match(/\[download\] Destination: (.+)/);
            if (destMatch) {
                const filePath = destMatch[1].trim();
                const basename = path_1.default.basename(filePath);
                dynamicInfo.title = basename.substring(0, basename.lastIndexOf("."));
                dynamicInfo.filePath = filePath;
                if (dynamicInfo.playlist_index == null) {
                    dynamicInfo.playlist_index = 1;
                    if (!si.informationExtracted) {
                        si.n_entries = 1;
                        si.isPlaylist = null;
                    }
                }
                if (si.appendColumns) {
                    ie.event.sender.send("playlist-progress", {
                        static: serializableSI({
                            appendColumns: true,
                            downloadFinished: false,
                        }),
                        dynamic: { ...dynamicInfo, percent: "0.00" },
                    });
                    si.appendColumns = false;
                }
            }
            const progressMatch = line.match(/\[download\]\s+([\d.]+)%/);
            if (progressMatch) {
                dynamicInfo.percent = parseFloat(progressMatch[1]).toFixed(2);
                ie.event.sender.send("playlist-progress", {
                    static: serializableSI({
                        appendColumns: false,
                        downloadFinished: false,
                    }),
                    dynamic: { ...dynamicInfo },
                });
            }
            if (line.includes("[download]") &&
                line.includes("has already been downloaded")) {
                dynamicInfo.percent = "100.00";
                ie.event.sender.send("playlist-progress", {
                    static: serializableSI({
                        appendColumns: false,
                        downloadFinished: false,
                    }),
                    dynamic: { ...dynamicInfo },
                });
            }
        });
    });
    subprocess.stderr.on("data", (data) => {
        (0, logger_1.logger)(data.toString());
    });
    subprocess.on("close", (code) => {
        subprocess = null;
        if (!exports.staticInfo.downloadFinished) {
            si.downloadFinished = true;
            exports.staticInfo.downloadFinished = true;
            ie.event.sender.send("playlist-progress", {
                static: serializableSI({ downloadFinished: true }),
                dynamic: { ...dynamicInfo, percent: "100.00" },
            });
        }
    });
    subprocess.on("error", (err) => {
        (0, logger_1.logger)(err.toString());
        ie.event.sender.send("ytdl-errors", err.toString());
    });
};
exports.playlist = playlist;
electron_1.ipcMain.on("stop-download", (event) => {
    if (subprocess) {
        subprocess.kill("SIGKILL");
        subprocess = null;
    }
    (0, app_notifications_1.killAllProcesses)();
    exports.staticInfo.appendColumns = true;
    exports.staticInfo.downloadFinished = false;
    exports.staticInfo.informationExtracted = false;
    event.sender.send("response");
});
const stopOnClose = () => {
    if (subprocess) {
        subprocess.kill("SIGKILL");
        subprocess = null;
    }
};
exports.stopOnClose = stopOnClose;
//# sourceMappingURL=download-playlist.js.map