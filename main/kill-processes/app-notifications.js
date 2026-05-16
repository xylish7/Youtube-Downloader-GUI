"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.killAllProcesses = exports.resetValues = exports.options = exports.messages = exports.noProcessActive = exports.exitMessages = void 0;
const mp3Converter = __importStar(require("../conversion/mp3Converter"));
const tree_kill_1 = __importDefault(require("tree-kill"));
exports.exitMessages = {
    download: null,
    conversion: null,
};
exports.noProcessActive = null;
exports.messages = {
    download: "Download in progress. Are you sure you want to quit?",
    conversion: "Conversion in progress. Are you sure you want to quit?",
};
exports.options = {
    type: "question",
    buttons: ["Yes", "No"],
    title: "Confirm",
    message: "",
};
const resetValues = () => {
    exports.exitMessages.download = null;
    exports.exitMessages.conversion = null;
    exports.noProcessActive = null;
};
exports.resetValues = resetValues;
const killAllProcesses = (callback) => {
    if (mp3Converter.childProcesses.length === 0) {
        if (callback && typeof callback === "function")
            callback();
    }
    else {
        mp3Converter.pendingProcesses.splice(0);
        const initialLength = mp3Converter.childProcesses.length;
        let index = mp3Converter.childProcesses.length;
        let conditionLength = 0;
        while (index--) {
            const pid = mp3Converter.childProcesses[index];
            if (pid === undefined)
                continue;
            (0, tree_kill_1.default)(pid, () => {
                mp3Converter.childProcesses.splice(index, 1);
                conditionLength++;
                if (conditionLength === initialLength) {
                    if (callback && typeof callback === "function")
                        callback();
                }
            });
        }
    }
};
exports.killAllProcesses = killAllProcesses;
//# sourceMappingURL=app-notifications.js.map