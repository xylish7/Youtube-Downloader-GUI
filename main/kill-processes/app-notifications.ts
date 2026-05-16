import * as mp3Converter from "../conversion/mp3Converter";
import kill from "tree-kill";

export const exitMessages: {
  download: string | null;
  conversion: string | null;
} = {
  download: null,
  conversion: null,
};

export let noProcessActive: boolean | null = null;

export const messages = {
  download: "Download in progress. Are you sure you want to quit?",
  conversion: "Conversion in progress. Are you sure you want to quit?",
};

export const options: Electron.MessageBoxOptions = {
  type: "question",
  buttons: ["Yes", "No"],
  title: "Confirm",
  message: "",
};

export const resetValues = (): void => {
  exitMessages.download = null;
  exitMessages.conversion = null;
  noProcessActive = null;
};

export const killAllProcesses = (callback?: () => void): void => {
  if (mp3Converter.childProcesses.length === 0) {
    if (callback && typeof callback === "function") callback();
  } else {
    mp3Converter.pendingProcesses.splice(0);
    const initialLength = mp3Converter.childProcesses.length;
    let index = mp3Converter.childProcesses.length;
    let conditionLength = 0;

    while (index--) {
      const pid = mp3Converter.childProcesses[index];
      if (pid === undefined) continue;
      kill(pid, () => {
        mp3Converter.childProcesses.splice(index, 1);
        conditionLength++;
        if (conditionLength === initialLength) {
          if (callback && typeof callback === "function") callback();
        }
      });
    }
  }
};
