import Sequelize, { DataTypes } from "sequelize";
import db from "../config/db.js";
import Profile from "./user_profile.js";

const Acount = db.define("user_acount", {
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
});
export default Acount;
