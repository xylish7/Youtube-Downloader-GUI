"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepLogs = exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const LOG_DIR = `${electron_1.app.getPath("userData")}/logs`;
const logger = (dataToLog) => {
    if (!fs_1.default.existsSync(LOG_DIR)) {
        fs_1.default.mkdirSync(LOG_DIR);
    }
    const currentDate = new Date().toISOString();
    const logFileName = currentDate.substr(0, currentDate.indexOf("T"));
    const logFilePath = `${LOG_DIR}/${logFileName}.txt`;
    String(dataToLog).replace(/[\n\r]/g, " ");
    const error_format = `${new Date().toLocaleString()}: ${dataToLog}\n`;
    fs_1.default.appendFile(logFilePath, error_format, (error) => {
        if (error)
            throw error;
    });
};
exports.logger = logger;
const keepLogs = (nrOfLogs) => {
    fs_1.default.readdir(LOG_DIR, (err, files) => {
        if (err)
            throw err;
        const nrOfLogsToDelete = files.length - nrOfLogs;
        const filesToDelete = files.slice(0, nrOfLogsToDelete);
        filesToDelete.forEach((fileName) => {
            fs_1.default.unlink(`${LOG_DIR}/${fileName}`, (err) => {
                if (err)
                    throw err;
            });
        });
    });
};
exports.keepLogs = keepLogs;
//# sourceMappingURL=logger.js.map