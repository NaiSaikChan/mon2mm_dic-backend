// controllers/posController.js
const { pool } = require('../app');
const getPartOfSpeeches = async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT * FROM PartOfSpeech ORDER BY pos_id;`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Part of Speeches:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    getPartOfSpeeches,
};