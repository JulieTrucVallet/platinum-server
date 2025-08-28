// controllers/recipesController.js
import Recipe from "../models/Recipe.js";

// Helper: make sure a value is always returned as an array
const toArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return val.split("\n").map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// Helper: same but specific for ingredients
const toIngredients = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return [];
};

// Get image URL (Cloudinary or local upload)
const getImageUrl = (req) => {
  if (!req.file) return "";
  if (req.file.path && /^https?:\/\//.test(req.file.path)) return req.file.path; // Cloudinary
  return `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;   // Local
};

// ------------------ CREATE ------------------
export const createRecipe = async (req, res) => {
  try {
    const { title, duration, link, category } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required." });

    const image = getImageUrl(req);
    const ingredients = toIngredients(req.body.ingredients);
    const steps = toArray(req.body.steps);

    const recipe = await Recipe.create({
      title,
      duration,
      link,
      category: category || undefined,
      ingredients,
      steps,
      image,
      user: req.user.userId,
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error("createRecipe error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ READ ------------------
export const getAllRecipes = async (_req, res) => {
  try {
    const recipes = await Recipe.find().populate("user", "username");
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("user", "username");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ UPDATE ------------------
export const updateRecipe = async (req, res) => {
  try {
    const updates = {};

    // Simple fields
    if ("title" in req.body)    updates.title = req.body.title;
    if ("duration" in req.body) updates.duration = req.body.duration;
    if ("link" in req.body)     updates.link = req.body.link;
    if ("category" in req.body) updates.category = req.body.category || undefined;

    // Arrays
    if ("ingredients" in req.body)
      updates.ingredients = toIngredients(req.body.ingredients);
    if ("steps" in req.body)
      updates.steps = toArray(req.body.steps);

    // Replace image only if a new file is uploaded
    if (req.file) {
      updates.image = getImageUrl(req);
    }

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or not authorized" });
    }

    res.status(200).json(recipe);
  } catch (err) {
    console.error("updateRecipe error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ------------------ DELETE ------------------
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or not authorized" });
    }
    res.status(200).json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FAVORITES
export const toggleFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const userId = req.user.userId;
    const isFavorite = recipe.favorites.some(id => String(id) === String(userId));

    if (isFavorite) recipe.favorites.pull(userId);
    else recipe.favorites.push(userId);

    await recipe.save();
    res.status(200).json({ message: isFavorite ? "Removed from favorites" : "Added to favorites" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserFavorites = async (req, res) => {
  try {
    const recipes = await Recipe.find({ favorites: req.user.userId })
      .populate("user", "username");
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// INGREDIENTS ONLY
export const updateIngredients = async (req, res) => {
  try {
    const ingredients = toIngredients(req.body.ingredients);
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: { ingredients } },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe.ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};