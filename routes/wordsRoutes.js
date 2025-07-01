// routes/wordsRoutes.js

const express = require('express');
const router = express.Router();
const wordsController = require('../controllers/wordsController');

// Search endpoint
router.get('/search', wordsController.searchWords);
router.get('/paginated-search', wordsController.paginatedSearchWords);

// Get word details by ID
router.get('/:id', wordsController.getWordById);

// *** Add a new word ***
// /api/words ကို POST request လာရင် addWord ကို ခေါ်မယ်။
router.post('/', wordsController.addWord);

// *** Update an existing word (PUT) ***
// /api/words/:id ကို PUT request လာရင် updateWord ကို ခေါ်မယ်။
router.put('/:id', wordsController.updateWord);

// *** Delete a word (DELETE) ***
// /api/words/:id ကို DELETE request လာရင် deleteWord ကို ခေါ်မယ်။
router.delete('/:id', wordsController.deleteWord);


module.exports = router;