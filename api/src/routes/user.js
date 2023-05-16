import express from "express";
import { signup } from "../controller/user.js";
import { isAuthenticated, login, logout } from "../controller/auth.js";
const router = express.Router();
router.post("/signup", (req, res) => signup(req, res));
router.post("/login", (req, res) => login(req, res));
router.post("/logout", isAuthenticated, (req, res) => logout(req, res));
router.post("/resetPassword/validate", (req, res) =>
  console.log("validate email")
);
router.post("/resetPassword", (req, res) => console.log("reset Password"));
export default router;
