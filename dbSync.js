import Profile from "./src/database/model/user_profile.js";
import Account from "./src/database/model/user_account.js";
import VerificationRequest from "./src/database/model/account_verification_request.js";
import sequelize from "./src/database/config/db.js";

export const syncDatabase = async () => {
  await sequelize.sync();
};
