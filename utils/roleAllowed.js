export function roleAllowed(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized! Token missing or invalid." });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    next(); // user role is valid, continue
  };
}
