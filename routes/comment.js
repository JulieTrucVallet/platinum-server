import express from "express";
import {
    addComment,
    getCommentsByRecipe,
} from "../controllers/commentController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.post("/:recipeId", protect, addComment);
router.get("/:recipeId", getCommentsByRecipe);

export default router;