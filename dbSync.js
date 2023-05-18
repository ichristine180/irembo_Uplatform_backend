import Profile from "./src/database/model/user_profile.js";
import Account from "./src/database/model/user_account.js";
import VerificationRequest from "./src/database/model/account_verification_request.js";
import sequelize from "./src/database/config/db.js";

const syncDatabase = async () => {
  // pass {force: true} to drop the tables and recreate them
  await sequelize.sync({ force: true });
};

syncDatabase();
