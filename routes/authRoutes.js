// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Make sure this path is correct

// Register a new user (Optional: you might only add admin users manually or through a separate admin panel)
router.post('/register', authController.registerUser);

// User login
router.post('/login', authController.loginUser);

// Refresh access token
router.post('/refresh-token', authController.refreshAccessToken);

// User logout
router.post('/logout', authController.logoutUser);

module.exports = router;