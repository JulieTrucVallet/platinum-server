import express from "express";
import {
    getFavorites,
    getProfile,
    loginUser,
    registerUser,
    toggleFavorite,
    updateProfile,
} from "../controllers/usersController.js";
import verifyToken from "../middlewares/auth.js";
import uploadCloud from "../middlewares/cloudinary.js";
// import uploadLocal from "../middlewares/uploadImage.js";

const router = express.Router();

// --- Profil utilisateur
router.get("/profile", verifyToken, getProfile);

// Choisis Cloudinary OU Local
router.put("/profile", verifyToken, uploadCloud.single("image"), updateProfile);
// router.put("/profile", verifyToken, uploadLocal.single("image"), updateProfile);

// --- Authentification
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Favoris
router.get("/favorites", verifyToken, getFavorites);
router.post("/favorites/:recipeId", verifyToken, toggleFavorite);

export default router;