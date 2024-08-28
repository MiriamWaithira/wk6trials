const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Log authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer token' format

    if (!token) return res.sendStatus(401); // If no token, return 401 Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // If token invalid, return 403 Forbidden
        console.log('Token Verified:', user); // Log verified user
        req.user = user; // Attach user to request object
        next(); // Proceed to next middleware/route handler
    });
};

module.exports = authenticateJWT;