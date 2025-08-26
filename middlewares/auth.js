import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") && header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
}