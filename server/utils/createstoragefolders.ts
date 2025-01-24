import fs from "fs/promises";
import path from "path";

import settingsFn from "./settings";
import Logging from "../utils/logging";
import { Enums } from "../types/exporter";


const settings = settingsFn();
const categoryFolders = ["documents"];

/**
 * Utility function to create base storage folders.
 * Ensures that the required directory structure is in place.
 */
async function createStorageFolders(): Promise<void> {
  try {
    const { basefolder } = await settings;
    const dataFolder = path.resolve(basefolder, "data");

    // Ensure the base data folder exists
    await ensureDirectoryExists(dataFolder);

    // Ensure each category folder exists
    for (const category of categoryFolders) {
      const categoryFolder = path.resolve(dataFolder, category);
      await ensureDirectoryExists(categoryFolder);
    }
  } catch (error: any) {
    Logging.general(Enums.LogLevel.ERROR, error.toString())
  }
}

/**
 * Ensures that a directory exists, creating it if necessary.
 * @param dirPath The directory path to check or create.
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export default createStorageFolders;
