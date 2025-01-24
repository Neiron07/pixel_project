import path from "path";
import fs from "fs/promises";
import { Dirent } from "fs";

import isPathValid from "./pathvalidator";
import { Files } from "types/types/files";



/**
 * Retrieves a list of files in the specified directory.
 * Validates the path before attempting to read the directory.
 * @param pathname - The directory path to retrieve files from.
 * @returns A promise resolving to an array of files with their names and sizes, or `null` if the path is invalid.
 */
export async function getFiles(pathname: string): Promise<Files | null> {
  if (!(await isPathValid(pathname))) {
    return null;
  }
  const readpath = await fs.readdir(pathname, { withFileTypes: true });
  const filesPromises = readpath
    .filter((f) => f.isFile())
    .map(async (f) => {
      const fileSize = (await fs.stat(path.join(pathname, f.name))).size;
      return { name: f.name, size: fileSize };
    });
  return Promise.all(filesPromises);
}

/**
 * Retrieves a list of subfolders in the specified directory.
 * Validates the path before attempting to read the directory.
 * @param pathname - The directory path to retrieve subfolders from.
 * @returns A promise resolving to an array of directory entries, or `null` if the path is invalid.
 */
export async function getFolders(pathname: string): Promise<Dirent[] | null> {
  if (!(await isPathValid(pathname))) {
    return null;
  }
  const readpath = await fs.readdir(pathname, { withFileTypes: true });
  return readpath.filter((f) => f.isDirectory());
}

/**
 * Removes items from a list based on their paths.
 * Filters out items whose resolved paths start with any path in the removeList.
 * @param primaryList - The primary list of items to filter.
 * @param removeList - A list of paths to remove from the primary list.
 * @param attr - The attribute of the item containing the path, or an empty string if the item itself is a path.
 * @param pathname - The base directory path to resolve item paths against.
 * @returns A promise resolving to the filtered list of items.
 */
export async function removeItemsFromList<T>(
  primaryList: T[],
  removeList: string[],
  attr: string,
  pathname: string
): Promise<T[]> {
  return primaryList.filter((item: T) => {
    const itemPath = path.resolve(
      pathname,
      // If `attr` is not empty, use `item[attr]`; otherwise, use the item itself.
      attr ? (item as any)[attr] : (item as any)
    );
    return !removeList.some((rm) => itemPath.startsWith(rm));
  });
}
