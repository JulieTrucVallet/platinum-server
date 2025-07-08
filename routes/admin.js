import express from "express";
import {
    createRecipe,
    deleteRecipe,
    getAllRecipes,
    updateRecipe,
} from "../controllers/adminController.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.use(verifyUser, checkAdmin);

router.get("/recipes", getAllRecipes);
router.post("/recipes", createRecipe);
router.put("/recipes/:id", updateRecipe);
router.delete("/recipes/:id", deleteRecipe);

export default router;