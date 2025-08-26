import express from "express";
import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeById,
  getUserFavorites,
  toggleFavorite,
  updateIngredients,
  updateRecipe,
} from "../controllers/recipesController.js";
import verifyToken from "../middlewares/auth.js";
import uploadCloud from "../middlewares/cloudinary.js";
// import uploadLocal from "../middlewares/uploadImage.js"; // 👉 si tu veux tester en local

const router = express.Router();

// --- Public
router.get("/", getAllRecipes);

// ⚠️ doit être avant "/:id"
router.get("/user/favorites", verifyToken, getUserFavorites);
router.get("/:id", getRecipeById);

// --- Authentifié : création / édition / suppression
// ✅ par défaut Cloudinary
router.post("/", verifyToken, uploadCloud.single("image"), createRecipe);
router.put("/:id", verifyToken, uploadCloud.single("image"), updateRecipe);

// 🚀 si tu veux tester local au lieu de Cloudinary, décommente juste :
// router.post("/", verifyToken, uploadLocal.single("image"), createRecipe);
// router.put("/:id", verifyToken, uploadLocal.single("image"), updateRecipe);

router.delete("/:id", verifyToken, deleteRecipe);

// --- Ingrédients
router.patch("/:id/ingredients", verifyToken, updateIngredients);

// --- Favoris
router.post("/:id/favorite", verifyToken, toggleFavorite);

export default router;