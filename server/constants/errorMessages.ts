export default {
  Texts: {
    NotEnoughPermissions: {
      CreateFolder: "Not enough permissions (create folder).",
      Upload: "Not enough permissions (upload).",
      Download: "Not enough permissions (download).",
      DeleteFile: "Not enough permissions (delete file).",
      DeleteFolder: "Not enough permissions (delete folder).",
    },
    General: {
      ServerError: "An unexpected server error occurred.",
    },
    File: {
      NotFound: "File not found.",
      NoFilesUploaded: "No files uploaded.",
      UploadedSuccessfully: "File(s) uploaded successfully.",
      DownloadError: "Error downloading file.",
      NoFilesFoundForUser: "No files found for the user.",
      DeletedSuccessfully: "File deleted successfully.",
      DeleteError: "Error deleting file.",
      UploadError: "Error uploading file:",
      FetchError: "Error fetching file:",
      FetchingUserFilesError: "Error fetching user files:",
    },
    Folder: {
      CreatedSuccessfully: "Folder created successfully.",
      DeletedSuccessfully: "Folder deleted successfully.",
      CreateError: "Error creating folder.",
      DeleteError: "Error deleting folder.",
    },
    Zip: {
      ZippingInProgess: "Zipping folder in progress.",
      ZippingFolderError: "Error zipping folder:"
    },
    Navigation: {
      NavigationError: "Navigation error:",
      PathNotFound: "Path not found",
    },
    User: {
      SuccessfullyRegistered: "User successfully registered!",
      RegistrationError: "Registrating error:",
      AlreadyExists: "Already exists",
      SuccessfullyAuthorized: "Successfully Authorized!",
      AuthorizationError: "Authorization error:",
      IncorrectLoginOrPasswordError: "Login or Password is incorrect.",
      UserIsNotAuthorized: "User is not authorized.",
      UserIsNotFound: "User is not found.",
      UserInformationGettingError: "Error on getting info about User:"
    },
    Authentication: {
      AuthHeaderMissing: "Authorization header is missing. Please provide a valid token.",
      TokenMissing: "Token is missing. Please provide a valid token.",
      InvalidToken: "Invalid token. Access denied."
    },
    Multer: {
      UploadDestinationError: "Failed to resolve upload destination",
      MulterError: "Multer error:"
    },
    RouteValidation: {
      UserNameShoudlContainMin3Symbols: "Username Should containe at least 3 symbols.",
      InvalidEmail: "Invalid email.",
      PasswordShouldContainMin6Symbols: "Password should contain at least 6 symbols.",
      PasswordRequired: "Password is required."
    },
    Database: {
      SuccessfullySync: "Database is successfully synchronized",
      SyncError: "Database synchronized Error:"
    },
    BullMq: {
      ErrorProcessingFile: "Error processing file"
    }
  },
  Functions: {
    File: {
      FileDownload: (pathname: string) => `Downloaded file: ${pathname}`,
    },
    BullMq: {
      ContainBannedWords: (words: string[]) => `Contains banned words: ${words.join(", ")}`,
      FileRejectedDue: (fileId: Number, words: string[]) => `File #${fileId} rejected due to banned words: ${words.join(", ")}`,
      FileApproved: (fileId: Number) => `File #${fileId} approved after processing.`,
      ProcessingFileError: (fileId: Number) => `Error processing file #${fileId}`,
    },
    User: {
      AttemptingToRegisterUser: (email: string) => `Attempting to register user: ${email}`,
      EmailAlreadyExists: (email: string) => `User with email ${email} already exists.`,
      RegisteredSuccesfully: (email: string) => `User registered successfully: ${email}`,
      UserLoginAttempt: (email: string) => `User login attempt: ${email}`,
      NoUserFoundWithEmail: (email: string) => `Login failed - no user found with email: ${email}`,
      InvalidPassword: (email: string) => `Login failed - invalid password for email: ${email}`,
      LoggedInSuccesfully: (email: string) => `User logged in successfully: ${email}`,
      RetrievingById: (userId: number) => `Retrieving user by ID: ${userId}`,
      NoUserFoundWithId: (userId: number) => `No user found with ID: ${userId}`,
    },
    Folder: {
      CreatingFolder: (folderName: string) => `Creating folder: ${folderName}`,
      AttemptInvalidPath: (fullPath: string) => `Attempted to zip an invalid path: ${fullPath}`,
      StartingArchiveProcess: (pathname: string) => `Starting archive process for folder: ${pathname}`,
      DeletingFile: (fullPath: string) => `Deleting file: ${fullPath}`,
      DeletingFolder: (fullPath: string) => `Deleting folder: ${fullPath}`,
      PathNotFound: (fullPath: string) => `Path not found: ${fullPath}`,
      AdminNavigation: (fullPath: string) => `Admin navigation: ${fullPath}`,
      NotHavePermissionToNavigate: (fullPath: string) => `User does not have navigation permissions for: ${fullPath}`,
    }
  }
};