import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user";  // Импортируем модель User

interface FileAttributes {
  id: number;
  userId: number;
  filename: string;
  fileData: Buffer;  // Хранение данных файла как Buffer (бинарные данные)
  status: string;
  reason: string | null; 
}

interface FileCreationAttributes extends Optional<FileAttributes, "id"> {}

class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: number;
  public userId!: number;
  public filename!: string;
  public fileData!: Buffer;  // Хранение бинарных данных
  public status!: string;
  public reason!: string | null; 

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Инициализация модели File
File.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileData: {
      type: DataTypes.BLOB("long"),  // Используем тип BLOB для хранения бинарных данных
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",  // Статус по умолчанию
    },
    reason: {
      type: DataTypes.STRING, // Поле для хранения причин
      allowNull: true, // Можно оставить пустым
    },
  },
  {
    sequelize,
    tableName: "files",
    timestamps: true,
  }
);

File.belongsTo(User, { foreignKey: "userId" });
User.hasMany(File, { foreignKey: "userId" });

export default File;
