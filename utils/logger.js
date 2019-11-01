const fs = require("fs");
const { app } = require("electron");

const LOG_DIR = `${app.getPath("userData")}/logs`;

const logger = dataToLog => {
  // Create directory for logs if it doesn't exists
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }

  // Create log file
  const currentDate = new Date().toISOString();
  const logFileName = currentDate.substr(0, currentDate.indexOf("T"));
  const logFilePath = `${LOG_DIR}/${logFileName}.txt`;

  // Remove any break lines from the string and replace them
  // with empty sapces
  dataToLog.toString().replace(/[\n\r]/g, " ");

  const error_format = `${new Date().toLocaleString()}: ${dataToLog}\n`;
  fs.appendFile(logFilePath, error_format, error => {
    if (error) throw error;
  });
};

// How many log files to keep
const keepLogs = nrOfLogs => {
  fs.readdir(LOG_DIR, (err, files) => {
    if (err) throw error;
    const nrOfLogsToDelete = files.length - nrOfLogs;
    const filesToDelete = files.slice(0, nrOfLogsToDelete);

    filesToDelete.forEach(fileName => {
      fs.unlink(`${LOG_DIR}/${fileName}`, err => {
        if (err) throw error;
      });
    });
  });
};

module.exports = { logger, keepLogs };
