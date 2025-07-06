import mongoose from 'mongoose';

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
  type: [
    {
      name: { type: String, required: true },
      quantity: { type: String, default: '' },
      checked: { type: Boolean, default: false }
    }
  ],
  default: []
}
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
