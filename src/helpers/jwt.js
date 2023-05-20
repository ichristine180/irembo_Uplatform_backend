import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "20m",
  });
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  return hashedPass;
};
const comparePassword = async (password, hash) => {
  const match = await bcrypt.compare(password, hash);
  return match;
};
export default {
  generateToken,
  hashPassword,
  comparePassword,
};
