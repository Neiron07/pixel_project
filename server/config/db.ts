import { Sequelize } from "sequelize";
import { DB_CONFIG } from "./config";

/**
 * Initialize Sequelize instance with database configuration.
 */
const sequelize = new Sequelize(
  DB_CONFIG.name,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host || "sql12.freesqldatabase.com",
    port: Number(DB_CONFIG.port) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development", // Log queries only in development mode
  }
);

/**
 * Test the database connection and log the result.
 * Terminates the process if the connection fails.
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure code
  }
};

/**
 * Export the initialized Sequelize instance.
 */
export default sequelize;
