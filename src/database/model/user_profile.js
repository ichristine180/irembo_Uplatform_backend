import Sequelize, { DataTypes } from "sequelize";
import db from "../config/db.js";
import UserAccount from "./user_account.js";

const UserProfile = db.define("user_profile", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  marital_status: {
    type: DataTypes.ENUM,
    values: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_photo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  identification_number: {
    type: DataTypes.STRING,
  },
  identity_image: {
    type: DataTypes.STRING,
  },
  user_account_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserAccount,
      key: "id",
    },
  },
});

UserProfile.belongsTo(UserAccount, { foreignKey: "user_account_id" });
UserAccount.hasOne(UserProfile, { foreignKey: "user_account_id" });

export default UserProfile;
