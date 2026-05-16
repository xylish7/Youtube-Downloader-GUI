import path from "path";
import fs from "fs";

interface StoreOptions {
  configName: string;
  defaults: Record<string, any>;
}

class Store {
  private path: string;
  private data: Record<string, any>;

  constructor(opts: StoreOptions) {
    const userDataPath = require("@electron/remote").app.getPath(
      "userData",
    ) as string;
    this.path = path.join(userDataPath, opts.configName + ".json");
    this.data = parseDataFile(this.path, opts.defaults);
  }

  get(key: string): any {
    return this.data[key];
  }

  set(key: string, val: any): void {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(
  filePath: string,
  defaults: Record<string, any>,
): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(filePath).toString());
  } catch (_error) {
    return defaults;
  }
}

export default Store;
