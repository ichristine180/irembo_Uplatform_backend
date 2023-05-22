import express from "express";
import multer from "multer";
import {
  login,
  loginSupportLink,
  logout,
  resetPassword,
  sendLoginLink,
  sendResetPasswordLink,
  verifyCode,
} from "../controller/auth.js";
import { isAuthenticated } from "../middlewares/authenticate.js";
const router = express.Router();
router.post("/login", (req, res) => login(req, res));
router.post("/verify", (req, res) => verifyCode(req, res));
router.post("/login/send", (req, res) => sendLoginLink(req, res));
router.post("/login/link", (req, res) => loginSupportLink(req, res));
router.post("/logout", (req, res) => logout(req, res));
router.post("/password/reset", (req, res) => sendResetPasswordLink(req, res));
router.post("/resetPassword", (req, res) => resetPassword(req, res));

export default router;
