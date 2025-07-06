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

router.delete('/:index', verifyToken, deleteFromShoppingList);
router.patch('/:index/check', verifyToken, toggleCheckIngredient);

export default router;