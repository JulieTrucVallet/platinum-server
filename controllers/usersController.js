import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

// Fonction utilitaire pour URL absolue (upload local)
const getFullUrl = (req, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// 🔹 Récupérer le profil utilisateur connecté
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const recipeCount = await Recipe.countDocuments({ user: user._id });
    const favoriteCount = user.favorites.length;

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

// 🔹 Mettre à jour email, mot de passe ou image de profil
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

      if (user?.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      updates.image = {
        url: getFullUrl(req, req.file.filename),
        public_id: req.file.filename,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Erreur updateProfile :", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Récupérer les favoris de l'utilisateur (avec populate pour voir les images)
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("favorites") // va chercher les recettes liées
      .select("favorites");

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Ajouter / Retirer un favori (toggle)
export const toggleFavorite = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const index = user.favorites.indexOf(recipeId);
    if (index > -1) {
      // déjà en favoris → retirer
      user.favorites.splice(index, 1);
    } else {
      // pas encore → ajouter
      user.favorites.push(recipeId);
    }

    await user.save();
    const updatedUser = await user.populate("favorites");

    res.status(200).json(updatedUser.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Register user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

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