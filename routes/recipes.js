import express from "express";
//import multer from "multer";
import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getAllRecipesForAdmin,
  getRecipeById,
  getUserFavorites,
  toggleFavorite,
  updateIngredients,
  updateRecipe,
} from "../controllers/recipesController.js";
import verifyToken from "../middlewares/auth.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import upload from "../middlewares/uploadImage.js";
import verifyUser from "../middlewares/verifyUser.js";

/* // Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage }); */

const router = express.Router();

// Public routes
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// Protected user routes
router.post("/", verifyUser, upload.single("image"), createRecipe);
router.put("/:id", verifyUser, upload.single("image"), updateRecipe);
router.delete("/:id", verifyUser, deleteRecipe);
router.put("/:id/ingredients", verifyUser, updateIngredients);

// Favorites management
router.post("/:id/favorite", verifyUser, toggleFavorite);
router.get("/user/favorites", verifyUser, getUserFavorites);

// Admin route
router.get("/admin/recipes", verifyToken, checkAdmin, getAllRecipesForAdmin);

/* // Upload image (optional utility route)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file received" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
}); */

export default router;