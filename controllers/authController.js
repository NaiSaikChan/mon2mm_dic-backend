// controllers/authController.js

const { pool } = require('../app');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// In-memory store for refresh tokens (key: userId, value: refreshToken)
const refreshTokensStore = {};

// 1. User Registration (Optional for now, but good to have)
// You might only manually add admin users for this dictionary.
const registerUser = async (req, res) => {
    const { username, password, role, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required.' });
    }

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user into database
        const [result] = await pool.execute(
            `INSERT INTO User (username, password_hash, role, email) VALUES (?, ?, ?, ?)`,
            [username, password_hash, role || 'user', email]
        );

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });

    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 'ER_DUP_ENTRY') { // MySQL error code for duplicate entry
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// 2. User Login
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Find user by username
        const [rows] = await pool.execute(`SELECT * FROM User WHERE username = ?`, [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT Token
        const payload = {
            userId: user.user_id,
            username: user.username,
            role: user.role // Include role in token for authorization
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // Refresh token expires in 1 days

        // Save refreshToken in-memory store
        refreshTokensStore[user.user_id] = refreshToken;

        res.json({
            token, // Access token
            refreshToken, // Refresh token
            user: {
                id: payload.userId.toString(),
                username: payload.username,
                email: user.email || '', // If email exists in the User table
                role: payload.role
            }
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// 3. Refresh Token Endpoint
const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided.' });

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        // Check if refreshToken matches the one in store
        if (refreshTokensStore[decoded.userId] !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }
        // Issue new access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, username: decoded.username, role: decoded.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
};

// 4. Logout (optional, to remove refresh token)
const logoutUser = (req, res) => {
    const { userId } = req.body;
    if (userId && refreshTokensStore[userId]) {
        delete refreshTokensStore[userId];
    }
    res.json({ message: 'Logged out successfully.' });
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
};