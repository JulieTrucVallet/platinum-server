import express from "express";
import {
    createRecipe,
    deleteRecipe,
    deleteUser,
    getAllRecipes,
    getAllUsers,
    updateRecipe
} from "../controllers/adminController.js";
import verifyToken from "../middlewares/auth.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const router = express.Router();

// Toutes les routes admin sont protégées
router.use(verifyToken, checkAdmin);

// --- Recettes
router.get("/recipes", getAllRecipes);
router.post("/recipes", createRecipe);
router.put("/recipes/:id", updateRecipe);
router.delete("/recipes/:id", deleteRecipe);

// --- Utilisateurs
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

export default router;