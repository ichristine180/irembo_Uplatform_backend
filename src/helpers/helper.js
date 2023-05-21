import { redisAsyncClient } from "../../index.js";

export const handleResponse = (res, error, message, data, statusCode) => {
  if (error) {
    res.status(statusCode || 401).json({
      success: "success",
      isSuccessfull: false,
      message,
      data: [],
    });
  } else {
    res.status(statusCode || 200).json({
      success: "success",
      isSuccessfull: true,
      message,
      data: data || [],
    });
  }
};

export const validateRequiredParams = (params, requiredParams) => {
  const missingParams = [];
  requiredParams.forEach((param) => {
    if (!params.hasOwnProperty(param)) {
      missingParams.push(param);
    }
  });
  if (missingParams.length > 0) {
    throw new Error(
      `Missing required parameter(s): ${missingParams.join(", ")}`
    );
  }
};
export const _validatePassword = (password) => {
  const strongRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
  if (!strongRegex.test(password)) {
    throw new Error(
      "Password should be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*)"
    );
  }
};
// check if redis value is expired
export const _isExpired = async (res, key, message) => {
  const ttl = await redisAsyncClient.ttl(key);
  if (ttl < 0) {
    redisAsyncClient.del(key);
    return handleResponse(res, true, message);
  }
};