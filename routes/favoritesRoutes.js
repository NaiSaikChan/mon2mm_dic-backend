// routes/favoritesRoutes.js

const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, favoritesController.getFavorites);
router.post('/', authenticateToken, favoritesController.addFavorite);
router.delete('/:wordId/:definitionId', authenticateToken, favoritesController.removeFavorite);
router.patch('/:wordId/:definitionId', authenticateToken, favoritesController.updateFavorite);

module.exports = router;
