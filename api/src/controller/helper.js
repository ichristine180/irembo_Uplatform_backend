export const handleResponse = (res, error, message, data) => {
  if (error) {
    res.status(500).json({
      error: true,
      message,
      result: [],
    });
  } else {
    res.status(200).json({
      error: false,
      message,
      result: data || [],
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