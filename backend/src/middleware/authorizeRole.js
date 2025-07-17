// Middleware to check if the user has the required role
module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized - Missing user role" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Forbidden - Requires ${requiredRole} role`,
        yourRole: req.user.role
      });
    }

    next();
  };
};