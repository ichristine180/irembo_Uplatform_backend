import express from "express";
const router = express.Router();
router.post("/signup", (req, res) => console.log("signup"));
router.post("/login", (req, res) => console.log("login"));
router.post("/resetPassword/validate", (req, res) =>
  console.log("validate email")
);
router.post("/resetPassword", (req, res) => console.log("reset Password"));
export default router;
