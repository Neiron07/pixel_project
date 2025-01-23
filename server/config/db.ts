import { Sequelize } from "sequelize";
import { DB_CONFIG } from "./config";

// 
const sequelize = new Sequelize(
  DB_CONFIG.name,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host || "sql12.freesqldatabase.com",
    port: Number(DB_CONFIG.port) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development", // Логируем запросы только в режиме разработки
  }
);

export const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Успешное подключение к базе данных.");
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:", error);
    process.exit(1);
  }
};

export default sequelize;
