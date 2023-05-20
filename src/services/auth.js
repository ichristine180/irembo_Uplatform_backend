import { redisAsyncClient } from "../../index.js";
import { handleResponse } from "../helpers/helper.js";
import { sendSms } from "./sendSms.js";

export const sendAuthenticationCode = async (req, res, id) => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  // Store the code in Redis
  await redisAsyncClient.setEx(code, 300, id);
  await sendSms({ to: req.body.mobile_no, text: `Code ${code}` });
  return handleResponse(
    res,
    false,
    "Code sent successfully,please check your phone"
  );
};
