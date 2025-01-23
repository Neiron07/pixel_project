import express from "express";
import cors from "cors";
import { initializeDatabase } from "./models";

import createStorageFolders from "@functions/files/createstoragefolders";

// setup the folders - data, temp
(async function () {
    await createStorageFolders();
    await initializeDatabase();
})();

// create require
const { Server } = require("http");
const app: express.Application = express();
const http = Server(app);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes =============================================================
import { authenticationRouter } from "@routes/user/authentication";
app.use("/auth", authenticationRouter);

import { router as navigationRouter } from "@routes/files/navigation";
app.use("/navigate", navigationRouter);

import { router as uploadRouter } from "@routes/files/UserFiles";
app.use("/upload", uploadRouter);

import { router as downloadRouter } from "@routes/files/download";
app.use("/download", downloadRouter);

import { router as CreateRouter } from "@routes/files/create";
app.use("/create", CreateRouter);

import { router as DeleteRouter } from "@routes/files/delete";
app.use("/delete", DeleteRouter);
// ====================================================================

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// route purely for testing authorisation
/* app.get("/testauth", auth, (req, res) => {
    console.log((req as any).user);
    res.send("Authorisation is working");
}); */

const PORT = process.env.PORT || 5000;
// listen to port at 0.0.0.0
http.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
});
