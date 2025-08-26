import express from "express";
import {
    addComment,
    getCommentsByRecipe,
} from "../controllers/commentController.js";
import verifyToken from "../middlewares/auth.js";

const router = express.Router();

// Ajouter un commentaire (auth requis)
router.post("/:recipeId", verifyToken, addComment);

// Récupérer les commentaires d'une recette (public)
router.get("/:recipeId", getCommentsByRecipe);

export default router;