import express from 'express';
import multer from 'multer';
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
} from '../controllers/recipesController.js';
import verifyToken from '../middlewares/auth.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import verifyUser from '../middlewares/verifyUser.js';

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // dossier d'upload
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = express.Router();

// CRUD Recettes
router.post('/', verifyUser, createRecipe);
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.put('/:id', verifyUser, updateRecipe);
router.delete('/:id', verifyUser, deleteRecipe);
router.put('/:id/ingredients', verifyUser, updateIngredients);

router.get('/admin/recipes', verifyToken, checkAdmin, getAllRecipesForAdmin);

// Favoris
router.post('/:id/favorite', verifyUser, toggleFavorite);
router.get('/user/favorites', verifyUser, getUserFavorites);

// 📤 Upload image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

export default router;
