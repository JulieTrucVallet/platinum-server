// routes/recipes.js
import express from "express";
import verifyToken from "../middlewares/auth.js";
import uploadCloud from "../middlewares/cloudinary.js"; // ✅ Cloudinary
// import uploadLocal from "../middlewares/uploadImage.js";    // ⬅️ fallback local si besoin
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

const router = express.Router();

// Liste + création
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// ✅ image via Cloudinary (sinon décommente uploadLocal)
// router.post("/", verifyToken, uploadLocal.single("image"), createRecipe);
router.post("/", verifyToken, uploadCloud.single("image"), createRecipe);

// ✅ update avec ou sans nouvelle image
// router.put("/:id", verifyToken, uploadLocal.single("image"), updateRecipe);
router.put("/:id", verifyToken, uploadCloud.single("image"), updateRecipe);

router.delete("/:id", verifyToken, deleteRecipe);

// Favoris
router.post("/:id/favorite", verifyToken, toggleFavorite);
router.get("/user/favorites", verifyToken, getUserFavorites);

// Ingrédients
router.patch("/:id/ingredients", verifyToken, updateIngredients);

export default router;