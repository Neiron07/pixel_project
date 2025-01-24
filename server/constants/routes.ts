export default {
    User: {
        Register: "/register",
        Login: "/login",
        WhoAmI: "/whoami"
    },
    File: {
        Create: "/folder",
        Zip: "/zip",
        DeleteFile: "/",
        DeleteFolder: "/folder",
        Download: "/",
        Navigation: "/:pathname(*)?",
        Upload: "/upload",
        FileById: "/file/:fileId",
        AllUserFiles: "/all",
    }
};
