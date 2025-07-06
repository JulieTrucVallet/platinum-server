import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [
    {
        name: { type: String, required: true },
        quantity: { type: String } // facultatif
    }
    ],
  steps: [String],
  image: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // <- correction ici
  isPublic: { type: Boolean, default: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String, default: '' } // ou undefined selon ta logique
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
