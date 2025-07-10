const express = require('express');
const router = express.Router();
const wordsController = require('../controllers/wordsController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const { pool } = require('../app');

// Admin: Search/filter words with pagination
router.get('/words', authenticateToken, authorizeRoles(['admin']), wordsController.paginatedSearchWords);

// Admin: Create new word
router.post('/words', authenticateToken, authorizeRoles(['admin']), wordsController.addWord);

// Admin: Update word
router.put('/words/:id', authenticateToken, authorizeRoles(['admin']), wordsController.updateWord);

// Admin: Delete word
router.delete('/words/:id', authenticateToken, authorizeRoles(['admin']), wordsController.deleteWord);

// Admin: Get dictionary statistics (see below)
router.get('/stats', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const [wordCount] = await pool.execute('SELECT COUNT(*) as totalWords FROM Word');
    const [definitionCount] = await pool.execute('SELECT COUNT(*) as totalDefinitions FROM Definition');
    const [userCount] = await pool.execute('SELECT COUNT(*) as totalUsers FROM User');
    res.json({
      totalWords: wordCount[0].totalWords,
      totalDefinitions: definitionCount[0].totalDefinitions,
      totalUsers: userCount[0].totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

module.exports = router;