import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user"; // Импортируем модель User

interface FileAttributes {
  id: number;
  userId: number;
  filename: string;
  filePath: string;
  status: string;
}

interface FileCreationAttributes extends Optional<FileAttributes, "id"> {}

class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: number;
  public userId!: number;
  public filename!: string;
  public filePath!: string;
  public status!: string;

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
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
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
