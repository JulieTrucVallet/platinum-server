export default function checkAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès interdit. Admin requis." });
  }
  next();
}