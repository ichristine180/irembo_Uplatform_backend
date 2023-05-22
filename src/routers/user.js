import express from "express";
import {
  getUserInfoByAccountId,
  requestVerifiyAccount,
  saveImage,
  signup,
  verificationFeedback,
} from "../controller/user.js";
import { upload } from "../middlewares/uploadImage.js";
import { isAuthenticated } from "../middlewares/authenticate.js";
const router = express.Router();
router.post("/signup", (req, res) => signup(req, res));
router.post("/upload", upload.single("file"), (req, res) =>
  saveImage(req, res)
);

router.post("/info", isAuthenticated, (req, res) =>
  getUserInfoByAccountId(req, res)
);

router.post("/verification", isAuthenticated, (req, res) =>
  requestVerifiyAccount(req, res)
);

router.post("/verification/feadback", isAuthenticated, (req, res) =>
  verificationFeedback(req, res)
);
export default router;
