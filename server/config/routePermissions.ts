import { Enums } from "../types/exporter";
import { Routes, ErrorMessages } from "../constants/exporter";

const routePermissionConfig = [
  {
    routePrefix: Routes.Create,
    permission: Enums.Permissions.CanCreateFolder,
    errorMessage: ErrorMessages.NotEnoughPermissions.CreateFolder,
  },
  {
    routePrefix: Routes.Upload,
    permission: Enums.Permissions.CanUpload,
    errorMessage: ErrorMessages.NotEnoughPermissions.Upload,
  },
  {
    routePrefix: Routes.Download,
    permission: Enums.Permissions.CanDownload,
    errorMessage: ErrorMessages.NotEnoughPermissions.Download,
  },
  {
    routePrefix: Routes.DeleteFile,
    permission: Enums.Permissions.CanDeleteFile,
    errorMessage: ErrorMessages.NotEnoughPermissions.DeleteFile,
  },
  {
    routePrefix: Routes.DeleteFolder,
    permission: Enums.Permissions.CanDeleteFolder,
    errorMessage: ErrorMessages.NotEnoughPermissions.DeleteFolder,
  },
];

export default routePermissionConfig;
