import express from "express";
import { getProfile, updateProfile } from "../controllers/usersController.js";
import verifyToken from "../middlewares/auth.js";
import uploadCloud from "../middlewares/cloudinary.js";
// import uploadLocal from "../middlewares/uploadImage.js"; // 👉 si tu veux tester en local

const router = express.Router();

// --- Profil utilisateur
router.get("/profile", verifyToken, getProfile);

// ✅ par défaut Cloudinary
router.put("/profile", verifyToken, uploadCloud.single("image"), updateProfile);

// 🚀 si tu veux tester en local au lieu de Cloudinary, décommente juste :
// router.put("/profile", verifyToken, uploadLocal.single("image"), updateProfile);

export default router;