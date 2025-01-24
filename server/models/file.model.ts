import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/db";
import User from "./user.model";
import { FileAttributes } from "../types/interfaces/FileAttributes";


interface FileCreationAttributes extends Optional<FileAttributes, "id"> { }

class File extends Model<FileAttributes, FileCreationAttributes>
  implements FileAttributes {
  public id!: number;
  public userId!: number;
  public filename!: string;
  public fileData!: Buffer;
  public status!: string;
  public reason!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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
      type: DataTypes.BLOB("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "files",
    timestamps: true,
  }
);

// Связи
File.belongsTo(User, { foreignKey: "userId" });
User.hasMany(File, { foreignKey: "userId" });

export default File;
