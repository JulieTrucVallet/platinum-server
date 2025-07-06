import Recipe from '../models/Recipe.js';

// Créer une recette
export const createRecipe = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    const recipe = await Recipe.create({
      ...req.body,
      user: req.user.userId,
      image: imagePath
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Récupérer toutes les recettes
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('user', 'username');
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer une recette par ID
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('user', 'username');
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour une recette (avec image possible)
export const updateRecipe = async (req, res) => {
  try {
    const updatedFields = { ...req.body };

    // Si une nouvelle image est envoyée, on l'ajoute
    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updatedFields,
      { new: true }
    );

    if (!recipe) return res.status(404).json({ message: 'Recette introuvable ou non autorisé' });

    res.status(200).json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer une recette
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!recipe) return res.status(404).json({ message: 'Recette introuvable ou non autorisé' });
    res.status(200).json({ message: 'Recette supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter ou retirer une recette des favoris
export const toggleFavorite = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });

    const userId = req.user.userId;
    const isFavorite = recipe.favorites.includes(userId);

    if (isFavorite) {
      recipe.favorites.pull(userId); // retirer
    } else {
      recipe.favorites.push(userId); // ajouter
    }

    await recipe.save();
    res.status(200).json({ 
      message: isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les recettes favorites d’un utilisateur
export const getUserFavorites = async (req, res) => {
  try {
    const recipes = await Recipe.find({ favorites: req.user.userId }).populate('user', 'username');
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateIngredients = async (req, res) => {
  const { id } = req.params;
  const { ingredients } = req.body;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recette non trouvée' });

    recipe.ingredients = ingredients;
    await recipe.save();
    res.status(200).json(recipe.ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRecipesForAdmin = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

