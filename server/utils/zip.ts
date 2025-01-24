import { zip } from "zip-a-folder";
import path from "path";

import { doesPathExist } from "./pathvalidator";

/**
 * Zips a folder into a `.zip` archive.
 * 
 * - If a zip file with the same name already exists, appends a numeric suffix (e.g., `folder(1).zip`).
 * - Ensures that no existing file is overwritten.
 * 
 * @param fullPath - The full path to the folder to be zipped.
 * @returns A promise that resolves when the folder is successfully zipped.
 */
async function zipFolder(fullPath: string): Promise<void> {
  // Default zip file name
  const zipName = `${path.basename(fullPath)}.zip`;
  const defaultZipPath = path.join(path.dirname(fullPath), zipName);

  // Check if the default zip file already exists
  const zipAlreadyExists = await doesPathExist(defaultZipPath);
  if (!zipAlreadyExists) {
    await zip(fullPath, defaultZipPath);
    return;
  }

  // If the default zip file exists, add a numeric suffix (e.g., folder(1).zip)
  let i = 1;
  while (true) {
    const newZipName = `${path.basename(fullPath)}(${i}).zip`;
    const newZipPath = path.join(path.dirname(fullPath), newZipName);

    // Check if the new zip file name exists
    const exists = await doesPathExist(newZipPath);
    if (!exists) {
      await zip(fullPath, newZipPath);
      break;
    }
    i++;
  }
}

export default zipFolder;
