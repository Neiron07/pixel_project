import { Sequelize } from "sequelize";
import { testDatabaseConnection } from "../config/db";
import sequelize from "../config/db";
import User from "./user";
import File from "./files";

export const initializeDatabase = async () => {
  await testDatabaseConnection();
  try {
    await sequelize.sync({ alter: true }); // Синхронизация структуры таблиц с моделями
    console.log("✅ База данных успешно синхронизирована.");
  } catch (error) {
    console.error("❌ Ошибка синхронизации базы данных:", error);
    process.exit(1);
  }
};

File.belongsTo(User, { foreignKey: "userId" });
User.hasMany(File, { foreignKey: "userId" });

export { sequelize, User, File };
