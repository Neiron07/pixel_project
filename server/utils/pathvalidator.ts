import fs from "fs/promises";

import settingsFn from "./settings";

const settings = settingsFn();

/**
 * Checks if the given path is valid within the application's base folder.
 * Ensures the path starts with the base folder path defined in settings.
 * 
 * @param pathname - The path to validate.
 * @returns A promise that resolves to `true` if the path is valid, `false` otherwise.
 */
async function isPathValid(pathname: string): Promise<boolean> {
  const cfg = await settings;
  const baseFolder = cfg.basefolder;
  return pathname.startsWith(baseFolder);
}

/**
 * Checks if a file or directory exists at the specified path.
 * 
 * @param pathname - The path to check.
 * @returns A promise that resolves to `true` if the path exists, `false` otherwise.
 */
export async function doesPathExist(pathname: string): Promise<boolean> {
  try {
    await fs.access(pathname);
    return true;
  } catch {
    return false;
  }
}

export default isPathValid;
