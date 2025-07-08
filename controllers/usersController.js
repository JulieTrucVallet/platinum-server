import bcrypt from "bcryptjs";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

// Get current user's profile information
export const getProfile = async (req, res) => {
  try {
    // Find user by ID and exclude the password from the result
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Count user's own recipes
    const recipes = await Recipe.find({ user: user._id });

    // Count how many recipes the user has marked as favorite
    const favorites = await Recipe.find({ favorites: user._id });

    // Return profile details
    res.status(200).json({
      username: user.username,
      email: user.email,
      image: user.image,
      recipeCount: recipes.length,
      favoriteCount: favorites.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user's email, password, or profile image
export const updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updates = {};

    // Update email if provided
    if (email) updates.email = email;

    // If a new password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // If a new image is uploaded, update the image path
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    // Send back the updated profile info with counts
    res.status(200).json({
      username: updatedUser.username,
      email: updatedUser.email,
      image: updatedUser.image,
      recipeCount: await Recipe.countDocuments({ user: updatedUser._id }),
      favoriteCount: await Recipe.countDocuments({
        favorites: updatedUser._id,
      }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};