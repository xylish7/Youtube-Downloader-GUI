"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFiles = exports.convertVideo = exports.pendingProcesses = exports.childProcesses = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const ffmpegOutput_1 = __importDefault(require("./ffmpegOutput"));
exports.childProcesses = [];
exports.pendingProcesses = [];
const removeChild = (childPid) => {
    const index = exports.childProcesses.indexOf(childPid);
    if (index !== -1)
        exports.childProcesses.splice(index, 1);
};
const checkAvailability = (noProcesses) => {
    return exports.childProcesses.length !== Number(noProcesses);
};
const checkPending = () => {
    return exports.pendingProcesses.length > 0;
};
const convertVideo = (playlistInfo, downloadInfo) => {
    const spawnAttributes = {
        ffmpeg_path: ffmpeg_static_1.default,
        args: [
            "-i",
            `${downloadInfo.savePath}\\${playlistInfo.dynamic.title}.${downloadInfo.video_format}`,
            "-map",
            "0:a:0",
            "-b:a",
            `${downloadInfo.audio_quality}`,
            "-y",
            `${downloadInfo.savePath}\\${playlistInfo.dynamic.title}.${downloadInfo.audio_format}`,
        ],
        options: { detached: false },
    };
    if (!checkAvailability(downloadInfo.no_processes)) {
        exports.pendingProcesses.push({ spawnAttributes, playlistInfo, downloadInfo });
    }
    else {
        if (!checkPending()) {
            spawnChild(spawnAttributes, playlistInfo, downloadInfo);
        }
        else {
            spawnChild(exports.pendingProcesses.shift(), playlistInfo, downloadInfo);
        }
    }
};
exports.convertVideo = convertVideo;
const spawnChild = (spawnAttributes, playlistInfo, downloadInfo) => {
    const ffmpegOutput = new ffmpegOutput_1.default();
    const sendData = { conversionFinished: false };
    const { ffmpeg_path, args, options } = spawnAttributes;
    const ffmpeg = (0, child_process_1.spawn)(ffmpeg_path, args, options);
    exports.childProcesses.push(ffmpeg.pid);
    sendData.playlist_index = playlistInfo.dynamic.playlist_index;
    sendData.isPlaylist = playlistInfo.static.isPlaylist;
    sendData.title = playlistInfo.dynamic.title;
    ffmpeg.stderr.on("data", (data) => {
        ffmpegOutput.string = data.toString();
        ffmpegOutput._raw_duration = playlistInfo.dynamic._raw_duration;
        sendData.percent = ffmpegOutput.percent;
        if (!isNaN(sendData.percent)) {
            playlistInfo.static.win.webContents.send("conversion-percent", sendData);
        }
    });
    ffmpeg.on("exit", (code) => {
        if (sendData.playlist_index === playlistInfo.static.n_entries ||
            sendData.isPlaylist === null) {
            sendData.conversionFinished = true;
        }
        if (code === 0) {
            if (playlistInfo.static.keepFiles === "false") {
                sendData.n_entries = playlistInfo.static.n_entries;
                fs_1.default.unlinkSync(`${downloadInfo.savePath}\\${sendData.title}.${downloadInfo.video_format}`);
                playlistInfo.static.win.webContents.send("conversion-done", sendData);
            }
            else {
                sendData.n_entries = playlistInfo.static.n_entries;
                playlistInfo.static.win.webContents.send("conversion-done", sendData);
            }
        }
        removeChild(ffmpeg.pid);
        if (checkPending()) {
            const pendingProcess = exports.pendingProcesses.shift();
            spawnChild(pendingProcess.spawnAttributes, pendingProcess.playlistInfo, pendingProcess.downloadInfo);
        }
    });
    ffmpeg.on("error", (err) => {
        if (err)
            console.log(err);
    });
};
const convertFiles = (fileInfo) => {
    const spawnAttributes = {
        ffmpeg_path: ffmpeg_static_1.default,
        args: [
            "-i",
            `${fileInfo.filePath}`,
            "-y",
            `${fileInfo.savePath}\\${fileInfo.title}.${fileInfo.audio_or_video_format}`,
        ],
        options: { detached: false },
    };
    if (!checkAvailability(fileInfo.no_processes)) {
        exports.pendingProcesses.push({ spawnAttributes, fileInfo });
    }
    else {
        if (!checkPending()) {
            spawnConvert(spawnAttributes, fileInfo);
        }
        else {
            spawnConvert(exports.pendingProcesses.shift(), fileInfo);
        }
    }
};
exports.convertFiles = convertFiles;
const spawnConvert = (spawnAttributes, fileInfo) => {
    fileInfo.win.webContents.send("debug", "Inside spawnConvert");
    const ffmpegOutput = new ffmpegOutput_1.default();
    const sendData = { conversionFinished: false, fileConverted: false };
    const { ffmpeg_path, args, options } = spawnAttributes;
    const ffmpeg = (0, child_process_1.spawn)(ffmpeg_path, args, options);
    exports.childProcesses.push(ffmpeg.pid);
    console.log("-------------------------------------------------------------------------------------------");
    console.log(ffmpeg);
    fileInfo.win.webContents.send("debug", ffmpeg);
    console.log("-------------------------------------------------------------------------------------------");
    sendData.index = fileInfo.index;
    ffmpeg.stderr.on("data", (data) => {
        fileInfo.win.webContents.send("debug", { "Inside data": data });
        ffmpegOutput.string = data.toString();
        ffmpegOutput.full_duration = ffmpegOutput.fullDuration;
        if (!isNaN(ffmpegOutput.full_duration)) {
            ffmpegOutput._raw_duration = ffmpegOutput.fullDuration;
        }
        if (ffmpegOutput._raw_duration) {
            sendData.percent = ffmpegOutput.percent;
            if (!isNaN(sendData.percent)) {
                fileInfo.win.webContents.send("convert-file-progress", sendData);
            }
        }
    });
    ffmpeg.on("exit", (code) => {
        fileInfo.win.webContents.send("debug", "Inside exit");
        sendData.fileConverted = true;
        sendData.percent = "100.00";
        if (sendData.index === fileInfo.n_entries)
            sendData.conversionFinished = true;
        if (code === 0) {
            if (fileInfo.delete_files === "true") {
                fs_1.default.unlinkSync(`${fileInfo.savePath}\\${fileInfo.title}${fileInfo.original_format}`);
                fileInfo.win.webContents.send("convert-file-progress", sendData);
            }
            else {
                fileInfo.win.webContents.send("convert-file-progress", sendData);
            }
        }
        removeChild(ffmpeg.pid);
        if (checkPending()) {
            const pendingProcess = exports.pendingProcesses.shift();
            spawnConvert(pendingProcess.spawnAttributes, pendingProcess.fileInfo);
        }
    });
    ffmpeg.on("error", (err) => {
        fileInfo.win.webContents.send("debug", "Inside error");
        if (err)
            console.log(err);
    });
    ffmpeg.stdout.on("data", (data) => {
        fileInfo.win.webContents.send("debug", data);
    });
};
//# sourceMappingURL=mp3Converter.js.map