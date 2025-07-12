const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/wordsController');

// Public endpoint for categories
router.get('/', getCategories);

module.exports = router;
