// testToken.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
    console.error('JWT_SECRET is not defined in the environment variables');
    process.exit(1);
}

const token = jwt.sign({ username: 'testUser' }, secret, { expiresIn: '1h' });
console.log('Generated Token:', token);

try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded Token:', decoded);
} catch (error) {
    console.error('Token Verification Error:', error);
}
