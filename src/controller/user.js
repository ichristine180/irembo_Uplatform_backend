import Profile from "../database/model/user_profile.js";
import Account from "../database/model/user_account.js";
import CustomError from "../helpers/CustomError.js";
import {
  _validatePassword,
  handleResponse,
  validateRequiredParams,
} from "../helpers/helper.js";
import jwt from "../helpers/jwt.js";
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
    // checking if we have provided email in redis cache
    const userExists = await redisAsyncClient.get(req.body.profileData.email);
    if (userExists != null) throw new CustomError("User already exists", 409);
    const { profileData, accountData } = _validation(req);
    accountData.password = await jwt.hashPassword(accountData.password);
    const accountResult = await Account.create(accountData);
    if (accountResult) await _createProfile(profileData, accountResult);
    await _cashingEmail(profileData);
    handleResponse(res, false, "Registered successfully");
  } catch (error) {
    handleResponse(res, true, error.message, null, error.status);
  }
};
export const saveImage = (req, res) => {
  try {
    const file = req.file;
    const imageUrl = file.path;
    handleResponse(res, false, "succes", { imageUrl });
  } catch (error) {
    console.error(error);
    handleResponse(res, true, error.message, null, error.status);
  }
};
const _cashingEmail = async (profileData) =>
  await redisAsyncClient.set(
    profileData.email,
    JSON.stringify(profileData.email)
  );

const _createProfile = async (profileData, accountResult) => {
  profileData.user_account_id = accountResult.id;
  await Profile.create(profileData);
};
