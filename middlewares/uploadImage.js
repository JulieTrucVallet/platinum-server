import multer from "multer";
import path from "path";

// Stockage en local (dans /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // dossier uploads à la racine
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Limite de taille : 5 Mo
const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadImage;