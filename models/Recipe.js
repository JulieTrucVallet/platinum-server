import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String },
  link: { type: String },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String }, // facultatif
    }
  ],
  steps: [String],
  image: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isPublic: { type: Boolean, default: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
