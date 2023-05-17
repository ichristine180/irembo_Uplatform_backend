import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${process.env.PINDO_TOKEN}`,
  },
};
export const sendSms = async (data) => {
  data.sender = "userM";
  data.to = checkCode(data.to) ? data.to : addCode(data.to);
  const res = await fetch(process.env.PINDO_URL, {
    ...options,
    body: JSON.stringify(data),
  });
  const body = await res.text();
  console.log(body);
  return body;
};

const checkCode = (number) => number.startsWith("+25");
const addCode = (number) => "+25".concat(number);
