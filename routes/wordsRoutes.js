// routes/wordsRoutes.js

const express = require('express');
const router = express.Router();
const wordsController = require('../controllers/wordsController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Search endpoint
router.get('/search', wordsController.searchWords);
router.get('/paginated-search', wordsController.paginatedSearchWords);
router.get('/random', wordsController.getRandomWords);
router.get('/word-of-the-day', wordsController.getWordOfTheDay);

// Category-based endpoints (must come before /:id to avoid conflicts)
router.get('/categories/:categoryId', wordsController.getWordsByCategory);
router.get('/categories/:categoryId/search', wordsController.searchWordsInCategory);

router.get('/:id', wordsController.getWordById);

// *** Add a new word ***
// /api/words ကို POST request လာရင် addWord ကို ခေါ်မယ်။
router.post('/', authenticateToken, authorizeRoles('admin', 'editor'), wordsController.addWord);

// *** Update an existing word (PUT) ***
// /api/words/:id ကို PUT request လာရင် updateWord ကို ခေါ်မယ်။
router.put('/:id', authenticateToken, authorizeRoles('admin', 'editor'), wordsController.updateWord);

// *** Delete a word (DELETE) ***
// /api/words/:id ကို DELETE request လာရင် deleteWord ကို ခေါ်မယ်။
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'editor'), wordsController.deleteWord);


module.exports = router;