import jwt from "jsonwebtoken";
import {
  _validatePassword,
  handleResponse,
  validateRequiredParams,
} from "./helper.js";
import Account from "../database/model/user_account.js";
import jwtt from "./jwt.js";
import { redisAsyncClient } from "../../index.js";
import { sendSms } from "./sendSms.js";

export const login = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["mobile_no", "password"]);
    const { mobile_no, password } = req.body;
    const user = await _findByMobile(mobile_no);
    if (user == null) return handleResponse(res, true, "User not found");
    const match = await jwtt.comparePassword(password, user.password);
    if (!match) return handleResponse(res, true, "Password is incorrect!");
    // after successfull login we are sending code for multifactor authentication
    await _sendCode(req, res, user.id);
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};

export const logout = async (req, res) => {
  const token = req.headers.authtoken?.split(" ")[1];
  // Remove token from Redis cache
  try {
    await redisAsyncClient.del(token);
    return handleResponse(res, false, "Logged out successfully");
  } catch (error) {
    handleResponse(res, true, error.message);
  }
};

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authtoken?.split(" ")[1];
  if (!token) return handleResponse(res, true, "authToken is missing");
  // Check if token is valid and stored in Redis cache
  try {
    const redisToken = await redisAsyncClient.get(token);
    if (!redisToken) return handleResponse(res, true, "Unauthorized");
    // Check if token is expired
    await _isExpired(res, token, "token is expired");
    next();
  } catch (error) {
    return handleResponse(res, true, "Internal Server Error");
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
    const user = await _findById(userId);
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
const _findByMobile = async (mobile) =>
  Account.findOne({
    where: { mobile_no: mobile },
    raw: true,
  });
const _findById = async (id) =>
  Account.findOne({
    where: { id: id },
    raw: true,
  });

const _handleLogin = async (res, id, code) => {
  const token = jwtt.generateToken({ id });
  // Store token in Redis cache for future validation
  await redisAsyncClient.setEx(token, 60, token); // expire after 10 minutes
  redisAsyncClient.del(code);
  return handleResponse(res, false, "success", { id, token });
};
const _isExpired = async (res, key, message) => {
  const ttl = await redisAsyncClient.ttl(key);
  if (ttl < 0) {
    redisAsyncClient.del(key);
    return handleResponse(res, true, message);
  }
};

const _sendLink = async (req, res, text) => {
  try {
    validateRequiredParams(req.body, ["mobile_no"]);
    const user = await _findByMobile(req.body.mobile_no);
    //Generate a unique token and associate it with the user's account
    const userToken = jwtt.generateToken(user.id); // e.g. "abc123"
    redisAsyncClient.setEx(userToken, 300, user.id);
    // Send an SMS to user's mobile number
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
const _sendCode = async (req, res, id) => {
  // Generate a random code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  // Store the code in Redis
  redisAsyncClient.setEx(code, 300, id);
  await sendSms({ to: req.body.mobile_no, text: `Code ${code}` });
  return handleResponse(
    res,
    false,
    "Code sent successfully,please check your phone"
  );
};
