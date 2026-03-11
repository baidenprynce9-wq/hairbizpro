require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        // Check if header exists
        if (!authHeader) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // Format should be: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Invalid token format." });
        }

        // Verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Attach admin info to request
        req.admin = verified;

        next();

    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;