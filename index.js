import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import commentRoutes from "./routes/comment.js";
import recipeRoutes from "./routes/recipes.js";
import shoppingListRoutes from "./routes/shoppingList.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// CORS config
const corsOptions = {
  origin: "https://platinum-client.onrender.com",
  credentials: true,
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://platinum-client.onrender.com");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/categories", categoryRoutes);

// DB Connection
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});