import Profile from "../database/model/user_profile.js";
import Account from "../database/model/user_account.js";
import { _validatePassword, handleResponse, validateRequiredParams } from "./helper.js";
import jwt from "./jwt.js";
import { redisAsyncClient } from "../../index.js";
const requiredParams = [
  "first_name",
  "last_name",
  "email",
  "dob",
  "gender",
  "marital_status",
  "nationality",
  "profile_photo",
];


const _validation = (req) => {
  validateRequiredParams(req.body, ["accountData", "profileData"]);
  const { profileData, accountData } = req.body;
  validateRequiredParams(accountData, ["mobile_no", "password"]);
  validateRequiredParams(profileData, requiredParams);
  _validatePassword(accountData.password);
  return req.body;
};
export const signup = async (req, res) => {
  try {
    // checking if we have provided email redis cache
    const userExists = await redisAsyncClient.get(req.body.profileData.email);
    if (userExists != null)
      return handleResponse(res, true, "User already exists");
    const { profileData, accountData } = _validation(req);
    accountData.password = await jwt.hashPassword(accountData.password);
    const accountResult = await Account.create(accountData);
    if (accountResult) {
      profileData.user_account_id = accountResult.id;
      await Profile.create(profileData);
    }
    //caching email for future use in checking if user is already exit
    await redisAsyncClient.set(
      profileData.email,
      JSON.stringify(profileData.email)
    );

    handleResponse(res, false, "Registered successfully");
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};
