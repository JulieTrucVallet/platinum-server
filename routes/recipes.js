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
import uploadImage from "../middlewares/uploadImage.js";

const router = express.Router();

// Public
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// Authentifié : création / édition / suppression
router.post("/", verifyToken, uploadImage.single("image"), createRecipe);
router.put("/:id", verifyToken, uploadImage.single("image"), updateRecipe);
router.delete("/:id", verifyToken, deleteRecipe);

// Ingrédients (si tu l’utilises)
router.patch("/:id/ingredients", verifyToken, updateIngredients);

// Favoris
router.post("/:id/favorite", verifyToken, toggleFavorite);
router.get("/user/favorites", verifyToken, getUserFavorites);

// ⚠️ SUPPRIMÉ dans ce fichier :
// - la route "/admin/recipes" (elle va uniquement dans routes/admin.js)
// - l’import direct de "multer"
// - la route utilitaire "/upload" (inutile si tu passes par uploadImage)

export default router;