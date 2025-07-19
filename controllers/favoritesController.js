// controllers/favoritesController.js

const { pool } = require('../app');

// Get all favorites for the logged-in user
const getFavorites = async (req, res) => {
    const userId = req.user.userId;
    try {
        const [rows] = await pool.execute(
            `SELECT f.*, w.word, w.pronunciation, w.language_id, substring(d.definition,1,100) AS definition, p.pos_ENsymbol, p.pos_Mmsymbol FROM Favorite f
             LEFT OUTER JOIN Word w ON f.word_id = w.word_id
             LEFT OUTER JOIN definition d ON f.definition_id = d.definition_id
             LEFT OUTER JOIN partofspeech p ON d.pos_id = p.pos_id
             WHERE f.user_id = ?`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Add a word to favorites
const addFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { word_id, definition_id, notes, metadata } = req.body;
    if (!word_id || !definition_id) {
        return res.status(400).json({ message: 'word_id and definition_id are required.' });
    }
    try {
        await pool.execute(
            `INSERT INTO Favorite (user_id, word_id, definition_id, notes, metadata) VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE notes = VALUES(notes), metadata = VALUES(metadata), definition_id = VALUES(definition_id)` ,
            [userId, word_id, definition_id, notes || null, metadata ? JSON.stringify(metadata) : null]
        );
        res.status(201).json({ message: 'Added to favorites.' });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Remove a word from favorites
const removeFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { wordId, definitionId } = req.params;
    if (!wordId || !definitionId) {
        return res.status(400).json({ message: 'wordId and definitionId are required.' });
    }
    try {
        const [result] = await pool.execute(
            `DELETE FROM Favorite WHERE user_id = ? AND word_id = ? AND definition_id = ?`,
            [userId, wordId, definitionId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Favorite not found.' });
        }
        res.json({ message: 'Removed from favorites.' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Update notes or metadata for a favorite
const updateFavorite = async (req, res) => {
    const userId = req.user.userId;
    const { wordId, definitionId } = req.params;
    const { notes, metadata } = req.body;
    if (!wordId || !definitionId) {
        return res.status(400).json({ message: 'wordId and definitionId are required.' });
    }
    try {
        const [result] = await pool.execute(
            `UPDATE Favorite SET notes = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND word_id = ? AND definition_id = ?`,
            [notes || null, metadata || null, userId, wordId, definitionId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Favorite not found.' });
        }
        res.json({ message: 'Favorite updated.' });
    } catch (error) {
        console.error('Error updating favorite:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
};
