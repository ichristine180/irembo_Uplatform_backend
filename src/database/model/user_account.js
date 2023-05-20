import Sequelize, { DataTypes } from "sequelize";
import db from "../config/db.js";

const Account = db.define("user_account", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  mobile_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false,
    default: 0,
  },
});
export default Account;
