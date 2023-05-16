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
