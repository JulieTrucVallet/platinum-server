// Middleware to restrict access to admin users only
const checkAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access restricted to administrators only." });
  }
  next();
};

export default checkAdmin;