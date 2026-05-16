import path from "path";
import { spawn, ChildProcess } from "child_process";
import { ipcMain } from "electron";
import * as mp3converter from "../conversion/mp3Converter";
import { killAllProcesses } from "../kill-processes/app-notifications";
import { logger } from "../../utils/logger";
import { getYtDlpPath } from "../update/ytdl-updater";
import { BrowserWindow } from "electron";

export interface StaticInfo {
  win: BrowserWindow | false;
  informationExtracted: boolean;
  downloadFinished: boolean;
  appendColumns: boolean;
  isPlaylist: boolean | null;
  keepFiles: boolean | string;
  n_entries?: number;
}

export interface DynamicInfo {
  playlist_index?: number;
  title?: string;
  filePath?: string;
  percent?: string;
  _raw_duration?: number;
}

export interface DownloadInfo {
  savePath: string;
  video_format: string;
  audio_format: string;
  audio_quality: string;
  mp3Conversion: string;
  keepFilesCheckbox: string;
  url: string;
  [key: string]: any;
}

export const staticInfo: StaticInfo = {
  win: false,
  informationExtracted: false,
  downloadFinished: false,
  appendColumns: true,
  isPlaylist: false,
  keepFiles: false,
};

export const ipcEvent: {
  event?: Electron.IpcMainEvent;
  downloadInfo?: DownloadInfo;
} = {};

let subprocess: ChildProcess | null = null;

export const playlist = (url: string): void => {
  const dynamicInfo: DynamicInfo = {};
  const si = staticInfo;
  const ie = ipcEvent;
  const { downloadInfo } = ie as { downloadInfo: DownloadInfo };

  const serializableSI = (
    overrides: Partial<StaticInfo> = {},
  ): Omit<StaticInfo, "win"> & Partial<StaticInfo> => {
    const { win, ...rest } = si;
    return { ...rest, ...overrides };
  };

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

  subprocess.stdout!.on("data", (data: Buffer) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      const playlistSizeMatch = line.match(
        /\[download\] Downloading item \d+ of (\d+)/,
      );
      if (playlistSizeMatch && !si.informationExtracted) {
        si.informationExtracted = true;
        si.n_entries = parseInt(playlistSizeMatch[1], 10);
        si.isPlaylist = true;
      }

      const playlistItemMatch = line.match(
        /\[download\] Downloading item (\d+) of \d+/,
      );
      if (playlistItemMatch) {
        dynamicInfo.playlist_index = parseInt(playlistItemMatch[1], 10);
        si.appendColumns = true;
      }

      const destMatch = line.match(/\[download\] Destination: (.+)/);
      if (destMatch) {
        const filePath = destMatch[1].trim();
        const basename = path.basename(filePath);
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
          ie.event!.sender.send("playlist-progress", {
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
        ie.event!.sender.send("playlist-progress", {
          static: serializableSI({
            appendColumns: false,
            downloadFinished: false,
          }),
          dynamic: { ...dynamicInfo },
        });
      }

      if (
        line.includes("[download]") &&
        line.includes("has already been downloaded")
      ) {
        dynamicInfo.percent = "100.00";
        ie.event!.sender.send("playlist-progress", {
          static: serializableSI({
            appendColumns: false,
            downloadFinished: false,
          }),
          dynamic: { ...dynamicInfo },
        });
      }
    });
  });

  subprocess.stderr!.on("data", (data: Buffer) => {
    logger(data.toString());
  });

  subprocess.on("close", (code: number | null) => {
    subprocess = null;
    if (!staticInfo.downloadFinished) {
      si.downloadFinished = true;
      staticInfo.downloadFinished = true;

      ie.event!.sender.send("playlist-progress", {
        static: serializableSI({ downloadFinished: true }),
        dynamic: { ...dynamicInfo, percent: "100.00" },
      });

      if (downloadInfo.mp3Conversion === "true") {
        si.keepFiles = downloadInfo.keepFilesCheckbox;
        mp3converter.convertVideo(
          { static: si, dynamic: dynamicInfo },
          downloadInfo,
        );
      }
    }
  });

  subprocess.on("error", (err: Error) => {
    logger(err.toString());
    ie.event!.sender.send("ytdl-errors", err.toString());
  });
};

ipcMain.on("stop-download", (event) => {
  if (subprocess) {
    subprocess.kill("SIGKILL");
    subprocess = null;
  }
  killAllProcesses();
  staticInfo.appendColumns = true;
  staticInfo.downloadFinished = false;
  staticInfo.informationExtracted = false;
  event.sender.send("response");
});

export const stopOnClose = (): void => {
  if (subprocess) {
    subprocess.kill("SIGKILL");
    subprocess = null;
  }
};
