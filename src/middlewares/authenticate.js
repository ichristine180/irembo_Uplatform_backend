import { redisAsyncClient } from "../../index.js";
import { _isExpired, handleResponse } from "../helpers/helper.js";

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