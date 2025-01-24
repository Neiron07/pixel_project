import fs from "fs/promises";
import path from "path";

import Logging from "../utils/logging";
import settingsFn from "../utils/settings";
import isPathValid from "../utils/pathvalidator";
import zipFolder from "../utils/zip";
import { getFiles, getFolders, removeItemsFromList } from "../utils/filesfolders";
import FileModel from "../models/file.model";
import { fileProcessingQueue } from "../config/bull";
import { ErrorMessages } from "constants/exporter"; // Import your translation object

/**
 * Loads application settings asynchronously.
 */
const settings = settingsFn();

/**
 * Service class for file and folder operations.
 * Contains business logic such as reading/writing files, database interactions,
 * and making calls to BullMQ.
 */
class FileService {
  /**
   * Retrieves the full (absolute) path to the given relative `pathname`,
   * using the configured `uploadfolder`.
   * @param pathname A path inside the root upload folder.
   */
  private async getFullPath(pathname: string): Promise<string> {
    const baseFolder = (await settings).uploadfolder;
    return path.join(baseFolder, pathname);
  }

  /**
   * Creates a new folder at the specified location.
   * @param folderName The name of the folder to be created.
   * @param pathname The path under which the folder should be created.
   */
  public async createFolder(folderName: string, pathname: string): Promise<void> {
    const fullBasePath = await this.getFullPath(pathname);
    const fullPath = path.join(fullBasePath, folderName);

    Logging.success(
      "GENERAL",
      ErrorMessages.Functions.Folder.CreatingFolder(fullPath)
    );
    await fs.mkdir(fullPath);
  }

  /**
   * Archives (zips) the specified folder.
   * @param pathname The path to the folder that should be zipped.
   * @throws Throws an error if the path is invalid.
   */
  public async createZip(pathname: string): Promise<void> {
    const fullPath = await this.getFullPath(pathname);

    const valid = await isPathValid(fullPath);
    if (!valid) {
      Logging.warn(
        "GENERAL",
        ErrorMessages.Functions.Folder.AttemptInvalidPath(fullPath)
      );
      throw new Error(ErrorMessages.Texts.Zip.ZippingFolderError);
    }

    Logging.success(
      "GENERAL",
      ErrorMessages.Functions.Folder.StartingArchiveProcess(pathname)
    );
    await zipFolder(fullPath);
  }

  /**
   * Deletes the specified file.
   * @param pathname The path to the file that should be deleted.
   */
  public async deleteFile(pathname: string): Promise<void> {
    const fullPath = await this.getFullPath(pathname);

    Logging.success(
      "GENERAL",
      ErrorMessages.Functions.Folder.DeletingFile(fullPath)
    );
    await fs.unlink(fullPath);
  }

  /**
   * Deletes a folder recursively (including all nested files and subfolders).
   * @param pathname The path to the folder that should be deleted.
   * @throws Throws an error if the path is not a folder or does not exist.
   */
  public async deleteFolder(pathname: string): Promise<void> {
    const fullPath = await this.getFullPath(pathname);

    Logging.success(
      "GENERAL",
      ErrorMessages.Functions.Folder.DeletingFolder(fullPath)
    );
    const folderExists = await fs.stat(fullPath);

    if (!folderExists.isDirectory()) {
      Logging.error("GENERAL", "Specified path is not a directory.", new Error("Not a directory"));
      throw new Error(ErrorMessages.Texts.Folder.DeleteError);
    }

    await fs.rmdir(fullPath, { recursive: true });
  }

  /**
   * Returns the absolute path for file download (used by the controller to send the file).
   * @param pathname The relative path inside the root upload folder.
   * @returns A string with the absolute path.
   */
  public async getDownloadPath(pathname: string): Promise<string> {
    const fullPath = await this.getFullPath(pathname);
    // Optionally verify file existence here:
    // await fs.access(fullPath);
    return fullPath;
  }

  /**
   * Retrieves a list of files and folders for navigation.
   * If the user is an admin, it returns everything; otherwise, it applies
   * the `show` or `hide` logic based on user permissions.
   * @param routeParam The path to navigate to.
   * @param accountName The account name (e.g., "admin" or something else).
   * @param account An object containing the user's access policy (show, hide, permissions).
   * @returns An object with arrays of files and folders.
   */
  public async navigation(
    routeParam: string,
    accountName: string,
    account: any
  ): Promise<{ files: any; folders: any }> {
    const fullPath = await this.getFullPath(routeParam);

    const pathExists = await fs
      .access(fullPath)
      .then(() => true)
      .catch(() => false);

    if (!pathExists) {
      Logging.error(
        "GENERAL",
        ErrorMessages.Functions.Folder.PathNotFound(fullPath)
      );
    }

    if (accountName === "admin") {
      // Admin user sees everything
      Logging.success(
        "GENERAL",
        ErrorMessages.Functions.Folder.AdminNavigation(fullPath)
      );
      const files = await getFiles(fullPath);
      const folders = await getFolders(fullPath);
      return { files, folders };
    }

    // Non-admin user
    const canNavigate = account?.permissions?.navigate ?? true;
    if (!canNavigate) {
      Logging.warn(
        "GENERAL",
        ErrorMessages.Functions.Folder.NotHavePermissionToNavigate(fullPath)
      );
      return { files: [], folders: [] };
    }

    const show = account?.show;
    const hide = account?.hide;

    // "show" logic
    if (show) {
      const uploadRoot = await this.getFullPath("");
      // If we're at the root
      if (path.relative(fullPath, uploadRoot) === "") {
        const allFolders = await getFolders(fullPath);
        if (!allFolders) return { files: [], folders: [] };
        const foldersToShow = allFolders.filter((folder) =>
          show.some((item: string) => folder.name.startsWith(item))
        );
        return { files: [], folders: foldersToShow };
      } else {
        // If we're not at the root
        const isInSubFolder = show.some((item: string) =>
          fullPath.startsWith(path.join(uploadRoot, item))
        );
        if (isInSubFolder) {
          const files = await getFiles(fullPath);
          const folders = await getFolders(fullPath);
          return { files, folders };
        } else {
          return { files: [], folders: [] };
        }
      }
    }

    // "hide" logic
    if (hide) {
      const files = await getFiles(fullPath);
      const folders = await getFolders(fullPath);

      const uploadRoot = await this.getFullPath("");
      const absoluteHide = hide.map((item: string) =>
        path.resolve(path.join(uploadRoot, item))
      );

      const filteredFolders = await removeItemsFromList(
        folders || [],
        absoluteHide,
        "name",
        fullPath
      );
      const filteredFiles = await removeItemsFromList(
        files || [],
        absoluteHide,
        "name",
        fullPath
      );
      return { files: filteredFiles, folders: filteredFolders };
    }

    // If neither show nor hide is provided
    const files = await getFiles(fullPath);
    const folders = await getFolders(fullPath);
    return { files, folders };
  }

  /**
   * Uploads an array of files:
   * 1) Creates a record in the database.
   * 2) Adds a job to the BullMQ queue for file checking.
   * @param files Array of Multer files.
   * @param userId The user's ID to associate with the files.
   */
  public async uploadFiles(files: Express.Multer.File[], userId: number): Promise<void> {
    for (const file of files) {
      const newFile = await FileModel.create({
        userId,
        filename: file.originalname,
        fileData: file.buffer,
        status: "pending",
      });

      // We do not have a dedicated text for DB save,
      // so we keep a custom message or you could add your own in Functions.
      Logging.success(
        "GENERAL",
        `[Saved to DB] ${file.originalname}`
      );

      await fileProcessingQueue.add("check-file", {
        fileId: newFile.id,
        fileData: file.buffer,
      });
    }
  }

  /**
   * Retrieves a single file (used for downloading) by file ID and user ID.
   * @param fileId The ID of the file to fetch.
   * @param userId The user's ID.
   * @returns The file object or null if not found.
   */
  public async getFileById(fileId: number, userId: number) {
    const file = await FileModel.findOne({
      where: { id: fileId, userId },
    });
    return file;
  }

  /**
   * Returns all files belonging to a specific user.
   * @param userId The ID of the user.
   * @returns An array of files (database models).
   */
  public async getAllUserFiles(userId: number) {
    const files = await FileModel.findAll({ where: { userId } });
    return files;
  }
}

export default new FileService();
