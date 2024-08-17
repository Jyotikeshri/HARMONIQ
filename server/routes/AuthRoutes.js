import express from "express";
import fs from "fs";
import path from "path";
import {
  getUserInfo,
  login,
  logout,
  removeUserImage,
  signup,
  updateUserImage,
  updateUserInfo,
} from "../controllers/AuthConroller.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import multer from "multer";
import { uploadImage } from "../config/cloudinaryConfig.js";

// Ensure the uploads directory exists
// const upload = multer({ dest: "/uploads/profiles/" });

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user-info", verifyToken, getUserInfo);
router.post("/update-user", verifyToken, updateUserInfo);
// router.get("/logout", verifyToken);
router.post(
  "/add-profile-image",
  verifyToken,
  uploadImage.single("profile-image"),
  updateUserImage
);
router.delete("/remove-profile-image", verifyToken, removeUserImage);

router.post("/logout", verifyToken, logout);

// Serve the profile images statically
// const staticPath = path.join(process.cwd(), "/uploads/profiles/");
// router.use("/uploads/profiles", express.static(staticPath));

export default router;
