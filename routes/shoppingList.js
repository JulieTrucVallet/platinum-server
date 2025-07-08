import express from "express";
import {
    addToShoppingList,
    deleteFromShoppingList,
    getShoppingList,
    toggleCheckIngredient,
} from "../controllers/shoppingListController.js";
import verifyToken from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, addToShoppingList);
router.get("/", verifyToken, getShoppingList);

router.delete("/:id", verifyToken, deleteFromShoppingList);
router.patch("/:id/check", verifyToken, toggleCheckIngredient);

export default router;