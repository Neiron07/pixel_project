import { Request, Response } from "express";

import fileService from "../services/file.service";
import Logging from "../utils/logging";
import { ErrorMessages } from "../constants/exporter";
import { Enums } from "../types/exporter";

/**
 * Creates a folder at the specified path.
 * @param req - Express request object containing `folderName` and `pathname` in the body.
 * @param res - Express response object.
 */
export async function createFolder(req: Request, res: Response) {
  try {
    const { folderName, pathname = "" } = req.body;
    await fileService.createFolder(folderName, pathname);
    Logging.success(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Folder.CreatedSuccessfully);
    return res.status(Enums.HttpStatusCodes.Success).send(ErrorMessages.Texts.Folder.CreatedSuccessfully);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Folder.CreateError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.Folder.CreateError);
  }
}

/**
 * Creates a ZIP archive of a folder at the specified path.
 * @param req - Express request object containing `pathname` in the body.
 * @param res - Express response object.
 */
export async function createZip(req: Request, res: Response) {
  try {
    const { pathname } = req.body;
    await fileService.createZip(pathname);
    Logging.success(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Zip.ZippingInProgess);
    return res.status(Enums.HttpStatusCodes.Success).send(ErrorMessages.Texts.Zip.ZippingInProgess);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.Zip.ZippingFolderError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.General.ServerError);
  }
}

/**
 * Deletes a file at the specified path.
 * @param req - Express request object containing `pathname` in the body.
 * @param res - Express response object.
 */
export async function deleteFile(req: Request, res: Response) {
  try {
    const { pathname } = req.body;
    await fileService.deleteFile(pathname);
    Logging.success(Enums.HttpRequestTypes.DELETE, ErrorMessages.Texts.File.DeletedSuccessfully);
    return res.status(Enums.HttpStatusCodes.Success).send(ErrorMessages.Texts.File.DeletedSuccessfully);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.DELETE, ErrorMessages.Texts.File.DeleteError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.General.ServerError);
  }
}

/**
 * Deletes a folder at the specified path.
 * @param req - Express request object containing `pathname` in the body.
 * @param res - Express response object.
 */
export async function deleteFolder(req: Request, res: Response) {
  try {
    const { pathname } = req.body;
    await fileService.deleteFolder(pathname);
    Logging.success(Enums.HttpRequestTypes.DELETE, ErrorMessages.Texts.Folder.DeletedSuccessfully);
    return res.status(Enums.HttpStatusCodes.Success).send(ErrorMessages.Texts.Folder.DeletedSuccessfully);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.DELETE, ErrorMessages.Texts.Folder.DeleteError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.Folder.DeleteError);
  }
}

/**
 * Sends a file to the client for download.
 * @param req - Express request object containing `pathname` in the query parameters.
 * @param res - Express response object.
 */
export async function downloadFile(req: Request, res: Response) {
  try {
    const pathname = req.query.pathname as string;
    Logging.log(Enums.LogLevel.INFO, Enums.HttpRequestTypes.GET, ErrorMessages.Functions.File.FileDownload(pathname));
    const fullPath = await fileService.getDownloadPath(pathname);
    res.sendFile(fullPath);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.File.DownloadError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.File.DownloadError);
  }
}

/**
 * Retrieves navigation details for the specified path.
 * @param req - Express request object with path parameters and account data in `res.locals`.
 * @param res - Express response object.
 */
export async function navigation(req: Request, res: Response) {
  try {
    const accountName = (res.locals as any)?.accountName;
    const account = (res.locals as any)?.account;
    const routeParam = req.params[0] || ""; // ':pathname(/*)?'
    const result = await fileService.navigation(routeParam, accountName, account);
    Logging.success(Enums.HttpRequestTypes.GET, `Navigation successful for route: ${routeParam}`);
    return res.json(result);
  } catch (error: any) {
    Logging.error(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.Navigation.NavigationError, error);
    
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.General.ServerError);
  }
}

/**
 * Handles file upload and stores the files in the system.
 * @param req - Express request object containing uploaded files and user data.
 * @param res - Express response object.
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[]; // multer
    const userId = (req as any).user?.id;
    if (!files || files.length === 0) {
      Logging.warn(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.File.NoFilesUploaded);
      return res.status(Enums.HttpStatusCodes.BadRequest).send(ErrorMessages.Texts.File.NoFilesUploaded);
    }
    await fileService.uploadFiles(files, userId);
    Logging.success(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.File.UploadedSuccessfully);
    return res.status(Enums.HttpStatusCodes.Success).send(ErrorMessages.Texts.File.UploadedSuccessfully);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.POST, ErrorMessages.Texts.File.UploadError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.General.ServerError);
  }
}

/**
 * Fetches a specific file by ID for the authenticated user.
 * @param req - Express request object with `fileId` in the route parameters.
 * @param res - Express response object.
 */
export async function getFile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const fileId = Number(req.params.fileId);
    const file = await fileService.getFileById(fileId, userId);

    if (!file) {
      Logging.warn(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.File.NotFound);
      return res.status(Enums.HttpStatusCodes.NotFound).send(ErrorMessages.Texts.File.NotFound);
    }

    Logging.success(Enums.HttpRequestTypes.GET, `File fetched successfully: ${file.filename}`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=${file.filename}`);
    return res.send(file.fileData);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.File.FetchError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.General.ServerError);
  }
}

/**
 * Fetches all files for the authenticated user.
 * @param req - Express request object containing user data.
 * @param res - Express response object.
 */
export async function getAllUserFiles(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const files = await fileService.getAllUserFiles(userId);
    if (!files || files.length === 0) {
      Logging.warn(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.File.NoFilesFoundForUser);
      return res.status(Enums.HttpStatusCodes.NotFound).send(ErrorMessages.Texts.File.NoFilesFoundForUser);
    }

    Logging.success(Enums.HttpRequestTypes.GET, `Fetched all files for user: ${userId}`);
    const mapped = files.map((f) => ({
      id: f.id,
      filename: f.filename,
      status: f.status,
      reason: f.reason,
    }));
    return res.status(Enums.HttpStatusCodes.Success).json(mapped);
  } catch (error) {
    Logging.error(Enums.HttpRequestTypes.GET, ErrorMessages.Texts.File.FetchingUserFilesError, error);
    return res.status(Enums.HttpStatusCodes.ServerError).send(ErrorMessages.Texts.General.ServerError);
  }
}
