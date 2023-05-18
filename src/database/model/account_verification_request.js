import Sequelize, { DataTypes } from "sequelize";
import db from "../config/db.js";
import UserAccount from "./user_account.js";
const VerificationRequest = db.define("account_verification_request", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  user_account_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserAccount,
      key: "id",
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    default: "Pending",
  },
});
VerificationRequest.belongsTo(UserAccount, { foreignKey: "user_account_id" });
UserAccount.hasOne(VerificationRequest, { foreignKey: "user_account_id" });
export default VerificationRequest;
