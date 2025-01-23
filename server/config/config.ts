import dotenv from "dotenv";

dotenv.config();

export const SECRET_KEY = process.env.JWT_SECRET || "asdasdw534!fas";
export const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "3h"; // По умолчанию токен действует 3 часа
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10); // Количество раундов для bcrypt
export const DB_CONFIG = {
  name: process.env.DB_NAME || "sql12758964",
  host: process.env.DB_HOST || "sql12.freesqldatabase.com",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USER || "sql12758964",
  password: process.env.DB_PASSWORD || "NKAlE5LZNu",
  database: process.env.DB_NAME || "app_database",
};
export const APP_PORT = parseInt(process.env.APP_PORT || "3000", 10);
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
export const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
export const ENVIRONMENT = process.env.NODE_ENV || "development";
