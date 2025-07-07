import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verifyToken, createCategory);
router.get('/', getCategories);

export default router;