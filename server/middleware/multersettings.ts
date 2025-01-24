import { Request } from "express";
import fs from "fs/promises";
import path from "path";
import { FileFilterCallback } from "multer";

import settingsFn from "../utils/settings";
import isPathValid from "../utils/pathvalidator";
import { ErrorMessages } from "../constants/exporter";
import Logging from "../utils/logging";
import { Enums } from "../types/exporter";

const settings = settingsFn();

/**
 * Utility class for handling Multer options.
 */
export default class MulterOptions {
  /**
   * Defines the destination folder for uploaded files.
   * @param req Express request object.
   * @param file The uploaded file object.
   * @param callback Callback to set the destination folder.
   */
  static async destination(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) {
    try {
      const pathname = decodeURI(req.body?.pathname || "");
      const baseFolder = (await settings).uploadfolder;
      const fullPath = path.resolve(baseFolder, pathname);

      callback(null, fullPath);
    } catch (error) {
      Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Multer.UploadDestinationError, error);
      callback(new Error(ErrorMessages.Texts.Multer.UploadDestinationError), "");
    }
  }

  /**
   * Defines the filename for uploaded files.
   * Adds a timestamp if a file with the same name already exists.
   * @param req Express request object.
   * @param file The uploaded file object.
   * @param callback Callback to set the file name.
   */
  static async filename(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ) {
    try {
      const pathname = decodeURI(req.body?.pathname || "");
      const baseFolder = (await settings).uploadfolder;
      const fullPath = path.join(baseFolder, pathname, file.originalname);

      // Check if the file already exists
      await fs.access(fullPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const { name, ext } = path.parse(file.originalname);
      const newFilename = `${name}_${timestamp}${ext}`;

      callback(null, newFilename);
    } catch {
      // If the file does not exist, use the original name
      callback(null, file.originalname);
    }
  }

  /**
   * File filter to validate upload path.
   * @param req Express request object.
   * @param file The uploaded file object.
   * @param callback Callback to determine if the file is allowed.
   */
  static async fileFilter(
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ) {
    try {
      const pathname = decodeURI(req.body?.pathname || "");
      const baseFolder = (await settings).uploadfolder;
      const fullPath = path.resolve(baseFolder, pathname);

      const isValid = await isPathValid(fullPath);

      if (isValid) {
        Logging.success(Enums.HttpRequestTypes.POST, `File passed filter: ${file.originalname}`);
      } else {
        Logging.warn(Enums.HttpRequestTypes.POST, `Invalid file path: ${fullPath}`);
      }

      callback(null, isValid);
    } catch (error) {
      Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Multer.MulterError, error);
      callback(null, false);
    }
  }

  /**
   * Handles errors in the Multer process.
   * @param err Error object.
   * @param next Callback to pass the error to the next middleware.
   */
  static onerror(error: any, next: (arg0: any) => void) {
    Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Multer.MulterError, error);
    next(error);
  }
}
