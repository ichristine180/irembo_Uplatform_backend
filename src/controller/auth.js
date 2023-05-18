import {
  _isExpired,
  _validatePassword,
  handleResponse,
  validateRequiredParams,
} from "../helpers/helper.js";
import Account from "../database/model/user_account.js";
import jwtt from "../helpers/jwt.js";
import { redisAsyncClient } from "../../index.js";
import { sendSms } from "../services/sendSms.js";
import { sendAuthenticationCode } from "../services/auth.js";
import { findUserById, findUserByMobile } from "../services/user.js";

export const login = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["mobile_no", "password"]);
    const { mobile_no, password } = req.body;
    const user = await findUserByMobile(mobile_no);
    if (!user) {
      throw new Error("User not found");
    }
    const passwordMatch = await _comparePassword(password, user.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password");
    }
    await sendAuthenticationCode(req, res, user.id);
  } catch (error) {
    return handleResponse(res, true, error.message || "Error occurred");
  }
};

export const logout = async (req, res) => {
  const token = req.headers.authtoken?.split(" ")[1];
  // Remove token from Redis cache
  try {
    await redisAsyncClient.del(token);
    return handleResponse(res, false, "Logged out successfully");
  } catch (error) {
    handleResponse(res, true, "Error occurred during logout");
  }
};

export const sendLoginLink = async (req, res) =>
  _sendLink(
    req,
    res,
    `Click here to login  ${process.env.UI_BASE_PATH}/login/link/?token=`
  );
export const loginSupportLink = async (req, res) => {
  try {
    const userId = await _validateLink(req, res);
    await _handleLogin(res, userId);
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};

export const sendResetPasswordLink = async (req, res) =>
  _sendLink(
    req,
    res,
    `Click here to Change your password  ${process.env.UI_BASE_PATH}/password/reset/?token=`
  );

export const resetPassword = async (req, res) => {
  try {
    const userId = await _validateLink(req, res);
    validateRequiredParams(req.body, ["old_password", "password"]);
    _validatePassword(req.body.password);
    const user = await findUserById(userId);
    const match = await jwtt.comparePassword(
      req.body.old_password,
      user.password
    );
    if (match) {
      const password = await jwtt.hashPassword(req.body.password);
      Account.update({ password }, { where: { id: userId } });
      return handleResponse(res, false, "Password changed successfully");
    }
    return handleResponse(res, true, "Old password is not correct");
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};
export const verifyCode = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["code"]);
    //in redis we have code as the key and user id as value
    const id = await redisAsyncClient.get(req.body.code);
    if (!id) return handleResponse(res, true, "Unauthorized");
    await _isExpired(res, req.body.code, "Code is expired");
    await _handleLogin(res, id, req.body.code);
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};

const _handleLogin = async (res, id, code) => {
  const token = jwtt.generateToken({ id });
  // Store token in Redis cache for future validation
  await redisAsyncClient.setEx(token, 600, token); // expire after 10 minutes
  redisAsyncClient.del(code);
  return handleResponse(res, false, "success", { id, token });
};

const _sendLink = async (req, res, text) => {
  try {
    validateRequiredParams(req.body, ["mobile_no"]);
    const user = await findUserByMobile(req.body.mobile_no);
    const userToken = jwtt.generateToken(user.id);
    await redisAsyncClient.setEx(userToken, 300, user.id);
    await sendSms({
      to: req.body.mobile_no,
      text: text + userToken,
    });
    return handleResponse(res, false, "link sent! please check your phone...");
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};

const _validateLink = async (req, res) => {
  const userToken = req.query.token;
  const userId = await redisAsyncClient.get(userToken);
  if (!userId) return handleResponse(res, true, "Invalid login link");
  await _isExpired(res, userToken, "Login link is expired");
  return userId;
};

const _comparePassword = async (password, hash) => {
  return await jwtt.comparePassword(password, hash);
};
