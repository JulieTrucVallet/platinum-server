import Recipe from "../models/Recipe.js";

// Fonction utilitaire pour construire une URL Cloudinary
const getImageUrl = (file) => {
  if (!file) return "";
  return file.path || file.secure_url; // Cloudinary donne ça
};

// POST - Create a new recipe (with optional image)
export const createRecipe = async (req, res) => {
  try {
    const imagePath = getImageUrl(req.file);
    const { title, duration, link } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const ingredients = req.body.ingredients
      ? JSON.parse(req.body.ingredients)
      : [];
    const steps = req.body.steps ? req.body.steps.split("\n") : [];

    const recipe = await Recipe.create({
      title,
      duration,
      link,
      ingredients,
      steps,
      image: imagePath,
      user: req.user.userId,
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error("🔥 Error creating recipe:", err);
    res.status(400).json({ message: err.message });
  }
};

// GET - Get all recipes (with user info)
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("user", "username");
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET - Get a single recipe by ID
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "user",
      "username"
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT - Update a recipe
export const updateRecipe = async (req, res) => {
  try {
    const updatedFields = { ...req.body };

    if (updatedFields.ingredients && typeof updatedFields.ingredients === "string") {
      updatedFields.ingredients = JSON.parse(updatedFields.ingredients);
    }
    if (updatedFields.steps && typeof updatedFields.steps === "string") {
      updatedFields.steps = updatedFields.steps.split("\n");
    }

    if (req.file) {
      updatedFields.image = getImageUrl(req.file);
    }

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updatedFields,
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or not authorized" });
    }

    res.status(200).json(recipe);
  } catch (err) {
    console.error("🔥 Error updating recipe:", err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE - Delete a recipe (if owned by user)
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!recipe) {
      return res
        .status(404)
        .json({ message: "Recipe not found or not authorized" });
    }
    res.status(200).json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH - Toggle favorite (add/remove)
export const toggleFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const userId = req.user.userId;
    const isFavorite = recipe.favorites.includes(userId);

    if (isFavorite) {
      recipe.favorites.pull(userId);
    } else {
      recipe.favorites.push(userId);
    }

    await recipe.save();
    res.status(200).json({
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET - Get current user's favorite recipes
export const getUserFavorites = async (req, res) => {
  try {
    const recipes = await Recipe.find({ favorites: req.user.userId }).populate(
      "user",
      "username"
    );
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH - Update only the ingredients of a recipe
export const updateIngredients = async (req, res) => {
  const { id } = req.params;
  const { ingredients } = req.body;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    recipe.ingredients = ingredients;
    await recipe.save();
    res.status(200).json(recipe.ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET - Get all recipes (admin only)
export const getAllRecipesForAdmin = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};