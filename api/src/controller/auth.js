import jwt from "jsonwebtoken";
import { handleResponse, validateRequiredParams } from "./helper.js";
import Account from "../database/model/user_account.js";
import jwtt from "./jwt.js";
import { redisAsyncClient } from "../../index.js";

export const login = async (req, res) => {
  try {
    validateRequiredParams(req.body, ["mobile_no", "password"]);
    const { mobile_no, password } = req.body;
    const user = await _findByMobile(mobile_no);
    if (user == null)
      return handleResponse(
        res,
        true,
        "User with provided mobile no not found"
      );
    const match = await jwtt.comparePassword(password, user.password);
    if (!match) return handleResponse(res, true, "Password is incorrect!");
    const token = jwtt.generateToken(user);
    user.token = token;
    delete user.password;
    // Store token in Redis cache for future validation
    await redisAsyncClient.setEx(token, 60, token); // expire after 10 minutes
    return handleResponse(res, false, "success", user);
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
    const ttl = await redisAsyncClient.ttl(token);
    if (ttl < 0) {
      redisAsyncClient.del(token);
      return handleResponse(res, true, "token is expired");
    }
    next();
  } catch (error) {
    return handleResponse(res, true, "Internal Server Error");
  }
};

const _findByMobile = async (mobile) =>
  Account.findOne({
    where: { mobile_no: mobile },
    raw: true,
  });
