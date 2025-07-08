import mongoose from "mongoose";
import User from "../models/User.js";

// Add a new item to the shopping list
export const addToShoppingList = async (req, res) => {
  const { name, quantity } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Ingredient name is required" });
  }

  try {
    // Find user by ID extracted from JWT
    const user = await User.findById(
      new mongoose.Types.ObjectId(req.user.userId)
    );

    // Add the new item to the list
    user.shoppingList.push({ name, quantity: quantity || "" });
    await user.save();

    // Return the last added item
    res.status(200).json(user.shoppingList[user.shoppingList.length - 1]);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Error while adding item" });
  }
};

// Get all shopping list items
export const getShoppingList = async (req, res) => {
  try {
    const user = await User.findById(
      new mongoose.Types.ObjectId(req.user.userId)
    );
    if (!user) {
      console.error("No user found with ID:", req.user.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Return the full list
    res.json(user.shoppingList);
  } catch (err) {
    res.status(500).json({ message: "Error while fetching shopping list" });
  }
};

// Remove an item by its MongoDB _id
export const deleteFromShoppingList = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const itemId = req.params.id;

    // Filter out the item to delete
    const updatedList = user.shoppingList.filter(
      (item) => item._id.toString() !== itemId
    );
    user.shoppingList = updatedList;
    await user.save();

    res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error while deleting item:", err);
    res.status(500).json({ message: "Error while deleting item" });
  }
};

// Toggle the "checked" status of an ingredient
export const toggleCheckIngredient = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const item = user.shoppingList.id(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Toggle the checked field
    item.checked = !item.checked;
    await user.save();

    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while toggling status" });
  }
};