import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";

  // Vérifie que l'en-tête commence bien par "Bearer ..."
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }

  const token = header.split(" ")[1];

  try {
    // Vérifie et décode le token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Ajoute les infos utilisateur dans req.user
    req.user = { userId: payload.userId, role: payload.role };

    next();
  } catch (err) {
    console.error("❌ Erreur vérification token:", err.message);
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
}