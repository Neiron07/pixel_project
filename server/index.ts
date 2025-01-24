import express, { Application, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";

// Local imports
import { initializeDatabase } from "./models";
import createStorageFolders from "./utils/createstoragefolders";
import { worker } from "./services/queue/file.processor";

import Logging from "./utils/logging";

import fileRouter from "./routes/file.routes";
import userRouter from "./routes/user.routes";

(async function initializeApp() {
  try {
    // 1. Ensure storage folders exist
    await createStorageFolders();

    // 2. Initialize the database
    await initializeDatabase();

    Logging.success("GENERAL", "Storage folders created and database initialized successfully.");
  } catch (error) {
    Logging.error("GENERAL", "Failed to initialize the application.", error);
    process.exit(1); // Optionally exit if initialization fails
  }
})();

/**
 * Create and configure the Express application.
 */
const app: Application = express();
const httpServer = createServer(app);

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === QUEUE WORKER EVENTS ===
worker.on("completed", (job) => {
  Logging.success("GENERAL", `Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  if (job) {
    Logging.error("GENERAL", `Job failed: ${job.id}`, err);
  } else {
    Logging.error("GENERAL", "Job failed: undefined job", err);
  }
});

// === ROUTES ===
// Mount user-related routes under /user
app.use("/user", userRouter);

// Mount file-related routes under /file
app.use("/files", fileRouter);

// A simple root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// === SERVER STARTUP ===
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  Logging.success("GENERAL", `Server started on port ${PORT}`);
});
