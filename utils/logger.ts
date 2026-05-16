import fs from "fs";
import { app } from "electron";

const LOG_DIR = `${app.getPath("userData")}/logs`;

export const logger = (dataToLog: unknown): void => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }

  const currentDate = new Date().toISOString();
  const logFileName = currentDate.substr(0, currentDate.indexOf("T"));
  const logFilePath = `${LOG_DIR}/${logFileName}.txt`;

  String(dataToLog).replace(/[\n\r]/g, " ");

  const error_format = `${new Date().toLocaleString()}: ${dataToLog}\n`;
  fs.appendFile(logFilePath, error_format, (error) => {
    if (error) throw error;
  });
};

export const keepLogs = (nrOfLogs: number): void => {
  fs.readdir(LOG_DIR, (err, files) => {
    if (err) throw err;
    const nrOfLogsToDelete = files.length - nrOfLogs;
    const filesToDelete = files.slice(0, nrOfLogsToDelete);

    filesToDelete.forEach((fileName) => {
      fs.unlink(`${LOG_DIR}/${fileName}`, (err) => {
        if (err) throw err;
      });
    });
  });
};
