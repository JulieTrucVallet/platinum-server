import express from 'express';
import {
    addToShoppingList,
    deleteFromShoppingList,
    getShoppingList,
    toggleCheckIngredient
} from '../controllers/shoppingListController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

// Utilisation des fonctions du contrôleur
router.post('/', verifyToken, addToShoppingList);
router.get('/', verifyToken, getShoppingList);

// ✅ Ici on corrige les routes :
router.delete('/:id', verifyToken, deleteFromShoppingList);
router.patch('/:id/check', verifyToken, toggleCheckIngredient);

export default router;