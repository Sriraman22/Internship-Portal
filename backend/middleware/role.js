// backend/middleware/role.js
export default function role(allowed = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    // normalize both sides
    const userRole = (req.user.role || "").toLowerCase();
    const allowedRoles = allowed.map(r => r.toLowerCase());

    console.log("🔍 Checking role:", userRole, "Allowed:", allowedRoles);

    if (allowedRoles.includes(userRole)) return next();
    return res.status(403).send("Forbidden: insufficient role");
  };
}
