// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Secret key for JWT. This must be the SAME as in authController.js
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key'; // CHANGE THIS IN PRODUCTION

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header (Bearer TOKEN_STRING)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "

    if (!token) {
        // If no token, return 401 Unauthorized
        return res.status(401).json({ message: 'Access Denied: No token provided.' });
    }

    try {
        // Verify token
        const verified = jwt.verify(token, JWT_SECRET);
        // Attach user info from token to the request object
        req.user = verified; // This will contain { userId, username, role }
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        // If token is invalid or expired
        console.error('JWT Verification Error:', error.message);
        return res.status(403).json({ message: 'Access Denied: Invalid or expired token.', error: error.message });
    }
};

// Middleware to check user roles for authorization
const authorizeRoles = (roles = []) => {
    // roles can be a single string 'admin' or an array ['admin', 'editor']
    if (typeof roles === 'string') {
        roles = [roles]; // Convert single string to array
    }

    return (req, res, next) => {
        // req.user must be available from authenticateToken middleware
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Authorization Failed: User role not found.' });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            // If user's role is not in the allowed roles array
            return res.status(403).json({ message: 'Access Denied: You do not have the necessary permissions for this action.' });
        }
        next(); // User has the required role, proceed
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
};