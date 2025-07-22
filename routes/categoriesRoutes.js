const express = require('express');
const router = express.Router();
const { getCategories, getCategoriesHierarchy } = require('../controllers/wordsController');

// Public endpoint for all categories
router.get('/', getCategories);

// Public endpoint for categories organized in 2-level hierarchy
router.get('/hierarchy', getCategoriesHierarchy);

module.exports = router;
