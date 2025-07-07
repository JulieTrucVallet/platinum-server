import Comment from '../models/Comment.js';

export const addComment = async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.create({
      user: req.user.userId,
      recipe: req.params.recipeId,
      content
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getCommentsByRecipe = async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};