import Recipe from '../models/Recipe.js';

// GET - Toutes les recettes
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('user', 'username');
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST - Créer une recette
export const createRecipe = async (req, res) => {
  try {
    const newRecipe = await Recipe.create(req.body);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT - Modifier une recette
export const updateRecipe = async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Recette non trouvée' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE - Supprimer une recette
export const deleteRecipe = async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Recette non trouvée' });
    res.status(200).json({ message: 'Recette supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};