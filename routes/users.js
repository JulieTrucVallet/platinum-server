import express from 'express';
import { getProfile, updateProfile } from '../controllers/usersController.js';
import verifyToken from '../middlewares/auth.js';
import uploadImage from '../middlewares/uploadImage.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, uploadImage.single('image'), updateProfile);

export default router;
