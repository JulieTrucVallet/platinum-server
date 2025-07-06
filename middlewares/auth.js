import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Accès refusé : aucun token fourni' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // tu pourras utiliser req.user.userId dans les routes
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export default verifyToken;
