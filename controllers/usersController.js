import bcrypt from 'bcryptjs';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Compter les recettes créées
    const recipes = await Recipe.find({ user: user._id });
    const favorites = await Recipe.find({ favorites: user._id });

    res.status(200).json({
    username: user.username,
    email: user.email,
    image: user.image,
    recipeCount: recipes.length,
    favoriteCount: favorites.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updates = {};

    if (email) updates.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (req.file) {
      user.image = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ image: user.image });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
