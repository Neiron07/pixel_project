import { Router } from "express";
import multer from "multer";

import authenticator from "../middleware/authenticator";
import * as fileController from "../controllers/file.controller";
import Routes from "../constants/routes";

/**
 * Router for file-related operations.
 */
const router = Router();

// Configure multer with in-memory storage
const upload = multer({ storage: multer.memoryStorage() }).any();

/**
 * @route POST /folder
 * @description Create a new folder
 * @access Protected
 */
router.post(Routes.File.Create, authenticator, fileController.createFolder);

/**
 * @route POST /zip
 * @description Create a ZIP archive from a folder
 * @access Protected
 */
router.post(Routes.File.Zip, authenticator, fileController.createZip);

/**
 * @route DELETE /
 * @description Delete a file
 * @access Protected
 */
router.delete(Routes.File.DeleteFile, authenticator, fileController.deleteFile);

/**
 * @route DELETE /folder
 * @description Delete a folder
 * @access Protected
 */
router.delete(Routes.File.DeleteFolder, authenticator, fileController.deleteFolder);

/**
 * @route GET /
 * @description Download a file
 * @access Public
 */
router.get(Routes.File.Download, fileController.downloadFile);

/**
 * @route GET /:pathname(*)
 * @description Navigate folders and files
 * @access Protected
 */
// router.get(Routes.File.Navigation, authenticator, fileController.navigation);

/**
 * @route POST /upload
 * @description Upload files
 * @access Protected
 */
router.post(Routes.File.Upload, authenticator, upload, fileController.uploadFile);

/**
 * @route GET /file/:fileId
 * @description Get a specific file by ID
 * @access Protected
 */
router.get(Routes.File.FileById, authenticator, fileController.getFile);

/**
 * @route GET /all
 * @description Get all files for the authenticated user
 * @access Protected
 */
router.get(Routes.File.AllUserFiles, authenticator, fileController.getAllUserFiles);

export default router;
