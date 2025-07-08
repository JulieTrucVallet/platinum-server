import Comment from "../models/Comment.js";

// POST - Add a comment to a recipe
export const addComment = async (req, res) => {
  const { content } = req.body;

  try {
    // Create a new comment with the current user's ID and the recipe ID from the URL
    const comment = await Comment.create({
      user: req.user.userId,
      recipe: req.params.recipeId,
      content,
    });

    // Return the new comment
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET - Get all comments for a specific recipe
export const getCommentsByRecipe = async (req, res) => {
  try {
    // Find all comments related to a specific recipe, sort by newest first
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};