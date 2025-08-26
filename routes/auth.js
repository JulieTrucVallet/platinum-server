import express from "express";
import { loginUser, registerUser } from "../controllers/usersController.js";
import verifyToken from "../middlewares/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Route protégée pour récupérer l'utilisateur courant
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;