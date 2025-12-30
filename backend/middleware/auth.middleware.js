import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Missing token" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export function requireManager(req, res, next) {
    const role = String(req.user?.role || "").toLowerCase();
    if (role !== "admin" && role !== "manager") {
        return res.status(403).json({ message: "Manager only" });
    }
    next();
}
