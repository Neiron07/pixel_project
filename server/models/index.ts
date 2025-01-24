import Logging from "../utils/logging";
import { Enums } from "types/exporter";

import sequelize, { testDatabaseConnection } from "../config/db";
import { ErrorMessages } from "../constants/exporter";
import User from "./user.model";
import File from "./file.model";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await testDatabaseConnection();
    await sequelize.sync({ alter: true });

    Logging.general(Enums.LogLevel.INFO, ErrorMessages.Texts.Database.SuccessfullySync);
  } catch (error) {
    Logging.general(Enums.LogLevel.ERROR, `ErrorMessages.Texts.Database.SyncError ${error}`,);
    process.exit(1);
  }
};

export { sequelize, User, File };
