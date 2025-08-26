import express from "express";
import { getProfile, updateProfile } from "../controllers/usersController.js";
import verifyToken from "../middlewares/auth.js";
import upload from "../middlewares/cloudinary.js"; // 🔹 nouveau middleware

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("image"), updateProfile);

export default router;