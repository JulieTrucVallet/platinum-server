import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, default: '' },
  checked: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  image: {
    type: String,
    default: ''
  },
  shoppingList: {
  type: [ingredientSchema],
  default: []
}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
