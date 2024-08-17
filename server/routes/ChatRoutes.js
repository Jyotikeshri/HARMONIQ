import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { uploadFile as uploadToCloudinary } from "../config/cloudinaryConfig.js";
import {
  getContactsForDMList,
  getMessages,
  uploadFile,
} from "../controllers/MessageController.js";
import multer from "multer";

const chatRoutes = Router();

const upload = multer({ dest: "/uploads/files/" });

chatRoutes.post(
  "/upload-files",
  verifyToken,
  uploadToCloudinary.single("file"),
  uploadFile
);

chatRoutes.post("/get-messages", verifyToken, getMessages);
chatRoutes.get("/get-contact-for-dm", verifyToken, getContactsForDMList);

export default chatRoutes;
