import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

// Récupérer le profil utilisateur connecté
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const recipeCount = await Recipe.countDocuments({ user: user._id });
    const favoriteCount = await Recipe.countDocuments({ favorites: user._id });

    res.status(200).json({
      username: user.username,
      email: user.email,
      image: user.image,
      recipeCount,
      favoriteCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour email, mot de passe ou image de profil
export const updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updates = {};

    if (email) updates.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const user = await User.findById(req.user.userId);

      // Supprime l'ancienne image de Cloudinary si elle existe
      if (user?.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      // Ajoute la nouvelle
      updates.image = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    const recipeCount = await Recipe.countDocuments({ user: updatedUser._id });
    const favoriteCount = await Recipe.countDocuments({ favorites: updatedUser._id });

    res.status(200).json({
      username: updatedUser.username,
      email: updatedUser.email,
      image: updatedUser.image,
      recipeCount,
      favoriteCount,
    });
  } catch (err) {
    console.error("Erreur updateProfile :", err);
    res.status(500).json({ message: err.message });
  }
};

// Register user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Créer l'utilisateur (le hash sera géré par le pre("save") du modèle User)
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};