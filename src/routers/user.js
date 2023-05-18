import express from "express";
import { saveImage, signup } from "../controller/user.js";
import { upload } from "../middlewares/uploadImage.js";
import { isAuthenticated } from "../middlewares/authenticate.js";
const router = express.Router();
router.post("/signup", (req, res) => signup(req, res));
router.post("/upload", isAuthenticated,upload.single("file"), (req, res) =>
  saveImage(req, res)
);
export default router;
