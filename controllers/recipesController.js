import { v2 as cloudinary } from "cloudinary";
import Recipe from "../models/Recipe.js";

// --- Utilitaire pour URL locale (si on veut tester sans Cloudinary)
const getLocalUrl = (req, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// --- POST - Create a new recipe (with optional image)
export const createRecipe = async (req, res) => {
  try {
    const { title, duration, link } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    // 🔹 Parsing des ingrédients
    let ingredients = [];
    if (req.body.ingredients) {
      try {
        ingredients = JSON.parse(req.body.ingredients);
      } catch (e) {
        return res.status(400).json({ message: "Invalid ingredients format" });
      }
    }

    // 🔹 Parsing des étapes
    const steps = req.body.steps ? req.body.steps.split("\n") : [];

    // 🔹 Gestion image (Cloudinary ou locale)
    let image = { url: "", public_id: "" };
    if (req.file) {
      if (req.file.path && !req.file.secure_url) {
        // Upload Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "platinum/recipes",
        });
        image = { url: result.secure_url, public_id: result.public_id };
      } else if (req.file.secure_url) {
        // Cas Cloudinary déjà fourni
        image = { url: req.file.secure_url, public_id: req.file.public_id };
      } else {
        // Cas fallback local
        image = { url: getLocalUrl(req, req.file.filename), public_id: req.file.filename };
      }
    }

    const recipe = await Recipe.create({
      title,
      duration,
      link,
      ingredients,
      steps,
      image,
      user: req.user.userId,
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error("🔥 Error creating recipe:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// --- GET - Get all recipes (with user info)
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("user", "username");
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- GET - Get a single recipe by ID
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("user", "username");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- PUT - Update a recipe
export const updateRecipe = async (req, res) => {
  try {
    const updatedFields = { ...req.body };

    // Parse si string
    if (updatedFields.ingredients && typeof updatedFields.ingredients === "string") {
      updatedFields.ingredients = JSON.parse(updatedFields.ingredients);
    }
    if (updatedFields.steps && typeof updatedFields.steps === "string") {
      updatedFields.steps = updatedFields.steps.split("\n");
    }

    // 🔹 Nouvelle image
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "platinum/recipes",
      });
      updatedFields.image = { url: result.secure_url, public_id: result.public_id };
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

// --- DELETE - Delete a recipe (if owned by user)
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or not authorized" });
    }

    // 🔹 Supprimer aussi l’image Cloudinary si elle existe
    if (recipe.image?.public_id) {
      await cloudinary.uploader.destroy(recipe.image.public_id);
    }

    res.status(200).json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- PATCH - Toggle favorite (add/remove)
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

// --- GET - Get current user's favorite recipes
export const getUserFavorites = async (req, res) => {
  try {
    const recipes = await Recipe.find({ favorites: req.user.userId }).populate("user", "username");
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- PATCH - Update only the ingredients of a recipe
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

// --- GET - Get all recipes (admin only)
export const getAllRecipesForAdmin = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};