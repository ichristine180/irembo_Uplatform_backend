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
import {
  createVerification,
  findProfileByUser,
  findRequestById,
  findUserById,
  findVerificationRequestByUser,
  updateAccountStatus,
  updateProfileInfo,
} from "../services/user.js";
import { sendSms } from "../services/sendSms.js";
import VerificationRequest from "../database/model/account_verification_request.js";
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
    handleResponse(res, false, "Registered successfully",null,201);
  } catch (error) {
    console.log(error)
    handleResponse(res, true, error.message, null, 500);
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
export const getUserInfoByAccountId = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["id"]);
    const userAccount = await findUserById(req.body.id);
    const userProfile = await findProfileByUser(req.body.id);
    const userVerificationRequest = await findVerificationRequestByUser(
      req.body.id
    );
    delete userAccount.password;
    return handleResponse(res, false, "success", {
      account: userAccount,
      profile: userProfile,
      vRequest: userVerificationRequest,
    });
  } catch (error) {
    console.log(error);
    handleResponse(res, true, error.message, null, error.status);
  }
};

export const requestVerifiyAccount = async (req, res) => {
  try {
    validateRequiredParams(req.body, [
      "user_account_id",
      "identification_number",
      "identity_image",
      "identification_type",
    ]);
    const results = await updateProfileInfo(req.body);
    if (results) {
      await updateAccountStatus(req.body.user_account_id, "PENDING");
      await createVerification(req.body.user_account_id);
      return handleResponse(
        res,
        false,
        "Verification request has been received."
      );
    }
  } catch (error) {
    console.log(error);
    handleResponse(res, true, error.message, null, error.status);
  }
};

export const verificationFeedback = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["request_id", "status"]);
    const vRequest = await findRequestById(req.body.request_id);
    if (!vRequest) throw new CustomError("Request not found", 404);
    await VerificationRequest.update(
      { status: "CLOSED" },
      { where: { id: req.body.request_id } }
    );
    const status = req.body.status == 1 ? "VERIFIED" : "UNVERIFIED";
    const results = await updateAccountStatus(vRequest.user_account_id, status);
    if (status == "VERIFIED" && results)
      _sendNotification(vRequest.user_account_id);
    handleResponse(res, false, "success");
  } catch (error) {
    console.log(error);
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

const _sendNotification = async (accountId) => {
  const account = await findUserById(accountId);
  await sendSms({
    to: account.mobile_no,
    text: "Congratulations! Your account  has been successfully verified.",
  });
};
