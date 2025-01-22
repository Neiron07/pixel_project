import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "sql12758964",
  process.env.DB_USER || "sql12758964",
  process.env.DB_PASSWORD || "NKAlE5LZNu",
  {
    host: process.env.DB_HOST || "sql12.freesqldatabase.com",
    port: Number(process.env.DB_PORT) || 3306,
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
