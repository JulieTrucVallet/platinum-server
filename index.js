import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";

// Routes
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import commentRoutes from "./routes/comment.js";
import recipeRoutes from "./routes/recipes.js";
import shoppingListRoutes from "./routes/shoppingList.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const app = express();

const PORT = Number(process.env.PORT) || 8010;

// --- ✅ CORS dev + prod
const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://platinum-client.onrender.com", // prod
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Autorise si pas d'origine (ex: Postman) ou si dans la liste
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// --- Middlewares globaux
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(morgan("dev"));

// --- Uploads locaux (si tu restes sur Multer disque)
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://platinum-client.onrender.com"); 
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.resolve("uploads"))
);

// --- Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/categories", categoryRoutes);

// --- 404
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// --- Handler global erreurs
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Erreur serveur",
  });
});

// --- Connexion DB + lancement
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });