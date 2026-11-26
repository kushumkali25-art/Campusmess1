const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      message: "Access denied. Admin permission required.",
    });
  }

  next();
};

module.exports = adminMiddleware;
