import fs from "fs";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import ffmpegPath from "ffmpeg-static";
import Output from "./ffmpegOutput";

export const childProcesses: (number | undefined)[] = [];
export const pendingProcesses: any[] = [];

interface SpawnAttributes {
  ffmpeg_path: string;
  args: string[];
  options: { detached: boolean };
}

const removeChild = (childPid: number | undefined): void => {
  const index = childProcesses.indexOf(childPid);
  if (index !== -1) childProcesses.splice(index, 1);
};

const checkAvailability = (noProcesses: string | number): boolean => {
  return childProcesses.length !== Number(noProcesses);
};

const checkPending = (): boolean => {
  return pendingProcesses.length > 0;
};

export const convertVideo = (playlistInfo: any, downloadInfo: any): void => {
  const spawnAttributes: SpawnAttributes = {
    ffmpeg_path: ffmpegPath as string,
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
    pendingProcesses.push({ spawnAttributes, playlistInfo, downloadInfo });
  } else {
    if (!checkPending()) {
      spawnChild(spawnAttributes, playlistInfo, downloadInfo);
    } else {
      spawnChild(pendingProcesses.shift(), playlistInfo, downloadInfo);
    }
  }
};

const spawnChild = (
  spawnAttributes: SpawnAttributes,
  playlistInfo: any,
  downloadInfo: any,
): void => {
  const ffmpegOutput = new Output();
  const sendData: any = { conversionFinished: false };

  const { ffmpeg_path, args, options } = spawnAttributes;
  const ffmpeg: ChildProcess = spawn(ffmpeg_path, args, options);
  childProcesses.push(ffmpeg.pid);

  sendData.playlist_index = playlistInfo.dynamic.playlist_index;
  sendData.isPlaylist = playlistInfo.static.isPlaylist;
  sendData.title = playlistInfo.dynamic.title;

  ffmpeg.stderr!.on("data", (data: Buffer) => {
    ffmpegOutput.string = data.toString();
    ffmpegOutput._raw_duration = playlistInfo.dynamic._raw_duration;
    sendData.percent = ffmpegOutput.percent;

    if (!isNaN(sendData.percent)) {
      playlistInfo.static.win.webContents.send("conversion-percent", sendData);
    }
  });

  ffmpeg.on("exit", (code: number | null) => {
    if (
      sendData.playlist_index === playlistInfo.static.n_entries ||
      sendData.isPlaylist === null
    ) {
      sendData.conversionFinished = true;
    }

    if (code === 0) {
      if (playlistInfo.static.keepFiles === "false") {
        sendData.n_entries = playlistInfo.static.n_entries;
        fs.unlinkSync(
          `${downloadInfo.savePath}\\${sendData.title}.${downloadInfo.video_format}`,
        );
        playlistInfo.static.win.webContents.send("conversion-done", sendData);
      } else {
        sendData.n_entries = playlistInfo.static.n_entries;
        playlistInfo.static.win.webContents.send("conversion-done", sendData);
      }
    }

    removeChild(ffmpeg.pid);

    if (checkPending()) {
      const pendingProcess = pendingProcesses.shift();
      spawnChild(
        pendingProcess.spawnAttributes,
        pendingProcess.playlistInfo,
        pendingProcess.downloadInfo,
      );
    }
  });

  ffmpeg.on("error", (err: Error) => {
    if (err) console.log(err);
  });
};

export const convertFiles = (fileInfo: any): void => {
  const spawnAttributes: SpawnAttributes = {
    ffmpeg_path: ffmpegPath as string,
    args: [
      "-i",
      `${fileInfo.filePath}`,
      "-y",
      `${fileInfo.savePath}\\${fileInfo.title}.${fileInfo.audio_or_video_format}`,
    ],
    options: { detached: false },
  };

  if (!checkAvailability(fileInfo.no_processes)) {
    pendingProcesses.push({ spawnAttributes, fileInfo });
  } else {
    if (!checkPending()) {
      spawnConvert(spawnAttributes, fileInfo);
    } else {
      spawnConvert(pendingProcesses.shift(), fileInfo);
    }
  }
};

const spawnConvert = (
  spawnAttributes: SpawnAttributes,
  fileInfo: any,
): void => {
  fileInfo.win.webContents.send("debug", "Inside spawnConvert");
  const ffmpegOutput = new Output();
  const sendData: any = { conversionFinished: false, fileConverted: false };

  const { ffmpeg_path, args, options } = spawnAttributes;
  const ffmpeg: ChildProcess = spawn(ffmpeg_path, args, options);
  childProcesses.push(ffmpeg.pid);
  console.log(
    "-------------------------------------------------------------------------------------------",
  );
  console.log(ffmpeg);
  fileInfo.win.webContents.send("debug", ffmpeg);
  console.log(
    "-------------------------------------------------------------------------------------------",
  );
  sendData.index = fileInfo.index;

  ffmpeg.stderr!.on("data", (data: Buffer) => {
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

  ffmpeg.on("exit", (code: number | null) => {
    fileInfo.win.webContents.send("debug", "Inside exit");
    sendData.fileConverted = true;
    sendData.percent = "100.00";

    if (sendData.index === fileInfo.n_entries)
      sendData.conversionFinished = true;

    if (code === 0) {
      if (fileInfo.delete_files === "true") {
        fs.unlinkSync(
          `${fileInfo.savePath}\\${fileInfo.title}${fileInfo.original_format}`,
        );
        fileInfo.win.webContents.send("convert-file-progress", sendData);
      } else {
        fileInfo.win.webContents.send("convert-file-progress", sendData);
      }
    }

    removeChild(ffmpeg.pid);

    if (checkPending()) {
      const pendingProcess = pendingProcesses.shift();
      spawnConvert(pendingProcess.spawnAttributes, pendingProcess.fileInfo);
    }
  });

  ffmpeg.on("error", (err: Error) => {
    fileInfo.win.webContents.send("debug", "Inside error");
    if (err) console.log(err);
  });

  ffmpeg.stdout!.on("data", (data: Buffer) => {
    fileInfo.win.webContents.send("debug", data);
  });
};
