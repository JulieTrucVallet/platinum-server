import express from 'express';
import { getProfile, updateProfile, updateProfileImage } from '../controllers/usersController.js';
import verifyToken from '../middlewares/auth.js';
import uploadImage from '../middlewares/uploadImage.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/profile/image', verifyToken, uploadImage.single('image'), updateProfileImage);

export default router;
