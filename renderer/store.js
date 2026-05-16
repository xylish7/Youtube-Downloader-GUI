"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Store {
    constructor(opts) {
        const userDataPath = require("@electron/remote").app.getPath("userData");
        this.path = path_1.default.join(userDataPath, opts.configName + ".json");
        this.data = parseDataFile(this.path, opts.defaults);
    }
    get(key) {
        return this.data[key];
    }
    set(key, val) {
        this.data[key] = val;
        fs_1.default.writeFileSync(this.path, JSON.stringify(this.data));
    }
}
function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs_1.default.readFileSync(filePath).toString());
    }
    catch (_error) {
        return defaults;
    }
}
exports.default = Store;
//# sourceMappingURL=store.js.map