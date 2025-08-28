import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

// Small helper to build a full URL when using local uploads
const getFullUrl = (req, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// Get profile of the logged-in user
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

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

// Update email, password or profile image
export const updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updates = {};

    if (email) updates.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // If a new file is uploaded, replace the old profile image
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
    console.error("updateProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user favorites (populate to show recipe details)
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("favorites")
      .select("favorites");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add or remove a recipe from favorites
export const toggleFavorite = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favorites.indexOf(recipeId);
    if (index > -1) {
      // already in favorites → remove
      user.favorites.splice(index, 1);
    } else {
      // not in favorites → add
      user.favorites.push(recipeId);
    }

    await user.save();
    const updatedUser = await user.populate("favorites");

    res.status(200).json(updatedUser.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user and return JWT
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
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