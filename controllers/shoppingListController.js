import mongoose from 'mongoose';
import User from '../models/User.js';

// ➕ Ajouter un ingrédient
export const addToShoppingList = async (req, res) => {
  const { name, quantity } = req.body;

  console.log('USER DECODED DEPUIS TOKEN:', req.user); // 🪵 DEBUG

  if (!name) {
    return res.status(400).json({ message: 'Le nom de l’ingrédient est requis' });
  }

  try {
    const user = await User.findById(new mongoose.Types.ObjectId(req.user.userId));
    user.shoppingList.push({ name, quantity: quantity || '' });
    await user.save();
    res.status(200).json(user.shoppingList[user.shoppingList.length - 1]);
  } catch (err) {
    console.error('Erreur serveur:', err); // 🪵 DEBUG
    res.status(500).json({ message: 'Erreur lors de l’ajout' });
  }
};

// 🔃 Récupérer la liste
export const getShoppingList = async (req, res) => {
    console.log('📥 req.user.userId =', req.user.userId);
  try {
    const user = await User.findById(new mongoose.Types.ObjectId(req.user.userId));
    if (!user) {
    console.error("Aucun utilisateur trouvé avec cet ID:", req.user.userId);
    return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user.shoppingList);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
};

// ❌ Supprimer par index
// ❌ Ancienne version supprimait par index (à éviter avec MongoDB)
// ✅ Nouvelle version : supprime par _id
export const deleteFromShoppingList = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const itemId = req.params.id;

    const updatedList = user.shoppingList.filter(item => item._id.toString() !== itemId);
    user.shoppingList = updatedList;
    await user.save();

    res.status(200).json({ message: 'Ingrédient supprimé' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};

// ✅ Cocher / décocher
export const toggleCheckIngredient = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const item = user.shoppingList.id(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Ingrédient non trouvé' });
    }

    item.checked = !item.checked;
    await user.save();

    res.status(200).json({ message: 'Statut mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du changement de statut' });
  }
};