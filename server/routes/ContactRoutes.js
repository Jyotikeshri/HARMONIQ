import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { searchContacts } from "../controllers/ContactController.js";
import { getAllContacts } from "../controllers/MessageController.js";

const contactRoutes = Router();

contactRoutes.post("/search", verifyToken, searchContacts);
contactRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactRoutes;
