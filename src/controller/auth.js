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
    console.log(user);
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
    if (!token) throw new Error("unauthorized");
    await redisAsyncClient.del(token);
    return handleResponse(res, false, "Logged out successfully");
  } catch (error) {
    console.log(error);
    handleResponse(res, true, error.message);
  }
};

export const sendLoginLink = async (req, res) =>
  _sendLink(
    req,
    res,
    `Click here to login  ${process.env.UI_BASE_PATH}login/link/`
  );
export const loginSupportLink = async (req, res) => {
  try {
    const userId = await _validateLink(req, res);
    console.log("===========", userId);
    await _handleLogin(res, userId);
  } catch (error) {
    console.log(error);
    handleResponse(res, true, error.message);
  }
};

export const sendResetPasswordLink = async (req, res) =>
  _sendLink(
    req,
    res,
    `Click here to Change your password  ${process.env.UI_BASE_PATH}password/reset/`
  );

export const resetPassword = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["password", "token"]);
    const userId = await _validateLink(req, res);
    _validatePassword(req.body.password);
    const password = await jwtt.hashPassword(req.body.password);
    Account.update({ password }, { where: { id: userId } });
    return handleResponse(res, false, "Password changed successfully");
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
  await redisAsyncClient.setEx(token, 600, token);
  code && redisAsyncClient.del(code);
  return handleResponse(res, false, "success", { id, token });
};

const _sendLink = async (req, res, text) => {
  try {
    validateRequiredParams(req.body, ["mobile_no"]);
    const user = await findUserByMobile(req.body.mobile_no);
    if (user) {
      const userToken = jwtt.generateToken(user.id);
      await redisAsyncClient.setEx(userToken, 300, user.id);
      await sendSms({
        to: req.body.mobile_no,
        text: text + userToken,
      });
      return handleResponse(
        res,
        false,
        "link sent! please check your phone..."
      );
    } else throw new Error("user not found");
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};

const _validateLink = async (req, res) => {
  const userToken = req.body.token;
  const userId = await redisAsyncClient.get(userToken);
  if (!userId) throw new Error("Invalid login link");
  await _isExpired(res, userToken, "Login link is expired");
  await redisAsyncClient.del(userToken);
  return userId;
};

const _comparePassword = async (password, hash) => {
  return await jwtt.comparePassword(password, hash);
};
