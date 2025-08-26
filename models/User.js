import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Subschema for shopping list ingredients
const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, default: "" },
    checked: { type: Boolean, default: false },
  },
  { _id: true }
);

// Main schema for users
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    shoppingList: {
      type: [ingredientSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer un mot de passe
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;