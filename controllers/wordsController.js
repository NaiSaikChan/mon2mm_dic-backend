// controllers/wordsController.js

const { pool } = require('../app');

// Search words based on query (existing function)
const searchWords = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM monbur_dic WHERE
        mon_word = ? OR
        mon_word LIKE ? OR
        mon_word LIKE ? OR
        definition LIKE ?
        ORDER BY CASE WHEN mon_word = ? THEN 1
          WHEN mon_word LIKE ? THEN 2
          WHEN mon_word LIKE ? THEN 3
        ELSE 4 END`,
      [query, `${query}%`, `%${query}%`,`%${query}%`, query, `${query}%`, `%${query}%`] // Note: parameters need to match your `LIKE` and exact match logic
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No matching words found.' });
    }

    res.json(rows);

  } catch (error) {
    console.error('Error searching words:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// *** Get word details by ID ***
const getWordById = async (req, res) => {
    const { id } = req.params; // This is word_id
    try {
        // Fetch word details from monbur_dic only
        const [wordRows] = await pool.execute(
            `SELECT * FROM monbur_dic WHERE word_id = ?`,
            [id]
        );
        if (wordRows.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        // Return the word data directly (no pagination, no extra tables)
        res.json(wordRows);
    } catch (error) {
        console.error('Error fetching word by ID:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// *** Add a new word with its definition ***
const addWord = async (req, res) => {
    const { mon_word, pronunciation, word_language_id, definition, example, definition_language_id, pos_id, synonyms } = req.body;

    try {
        await pool.query('START TRANSACTION');

        // 1. Insert into Word table
        const [wordResult] = await pool.execute(
            `INSERT INTO Word (word, pronunciation, language_id) VALUES (?, ?, ?)`,
            [mon_word, pronunciation, word_language_id]
        );
        const word_id = wordResult.insertId;

        // 2. Insert into Definition table
        const [definitionResult] = await pool.execute(
            `INSERT INTO Definition (word_id, definition, example, language_id, pos_id) VALUES (?, ?, ?, ?, ?)`,
            [word_id, definition, example, definition_language_id, pos_id]
        );

        // 3. Insert into Synonym table (if synonyms are provided)
        if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
            const synonymValues = synonyms.map(s => [word_id, s.text]);
            await pool.query(
                `INSERT INTO Synonym (word_id, synonym) VALUES ?`,
                [synonymValues] // Use array of arrays for bulk insert
            );
        }

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Word, Definition, and Synonyms added successfully', word_id, definition_id: definitionResult.insertId });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error adding word:', error);
        res.status(500).json({ message: 'Failed to add word.', error: error.message });
    }
};

// *** Update an existing word and its definition ***
const updateWord = async (req, res) => {
    const { id } = req.params; // This is word_id
    const { mon_word, pronunciation, word_language_id, definition, example, definition_language_id, pos_id, definition_id, synonyms } = req.body;

    if (!definition_id) {
        return res.status(400).json({ message: 'Definition ID is required to update definition.' });
    }

    try {
        await pool.query('START TRANSACTION');

        // 1. Update Word table
        const [wordUpdateResult] = await pool.execute(
            `UPDATE Word SET word = ?, pronunciation = ?, language_id = ? WHERE word_id = ?`,
            [mon_word, pronunciation, word_language_id, id]
        );

        // 2. Update Definition table
        const [definitionUpdateResult] = await pool.execute(
            `UPDATE Definition SET definition = ?, example = ?, language_id = ?, pos_id = ? WHERE definition_id = ? AND word_id = ?`,
            [definition, example, definition_language_id, pos_id, definition_id, id]
        );

        // 3. Update Synonyms: Simplest approach is to delete all existing and re-insert
        await pool.execute(`DELETE FROM Synonym WHERE word_id = ?`, [id]);
        if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
            const synonymValues = synonyms.map(s => [id, s.text]);
            await pool.query(
                `INSERT INTO Synonym (word_id, synonym) VALUES ?`,
                [synonymValues]
            );
        }

        if (wordUpdateResult.affectedRows === 0 && definitionUpdateResult.affectedRows === 0) {
             await pool.query('ROLLBACK');
             return res.status(404).json({ message: 'Word or Definition not found.' });
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Word and Definition updated successfully' });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating word:', error);
        res.status(500).json({ message: 'Failed to update word.', error: error.message });
    }
};


// *** NEW FUNCTION: Delete a word and its associated definitions ***
const deleteWord = async (req, res) => {
  const { id } = req.params; // URL parameter ကနေ Word ID ကို ရယူမယ်။

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Delete definitions associated with the word first (due to foreign key constraints)
    const [definitionDeleteResult] = await connection.execute(
      `DELETE FROM Definition WHERE word_id = ?`,
      [id]
    );

    // 2. Then, delete the word from the 'Word' table
    const [wordDeleteResult] = await connection.execute(
      `DELETE FROM Word WHERE word_id = ?`,
      [id]
    );

    if (wordDeleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Word with ID ${id} not found.` });
    }

    await connection.commit();
    res.json({ message: `Word with ID ${id} and its definitions deleted successfully! Definitions deleted: ${definitionDeleteResult.affectedRows}` });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting word:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const paginatedSearchWords = async (req, res) => {
  const { query = '', page = 1, pageSize = 20, posId } = req.query;

  const limit = Math.max(parseInt(pageSize), 1);
  const offset = (Math.max(parseInt(page), 1) - 1) * limit;

  try {
    // Build WHERE clause and params
    let whereClauses = [];
    let params = [];
    let orderParams = [];

    // If query is not empty, add search conditions
    if (query && query.trim() !== '') {
      whereClauses.push('(mon_word = ? OR mon_word LIKE ? OR mon_word LIKE ? OR definition LIKE ?)');
      params.push(query, `${query}%`, `%${query}%`, `%${query}%`);
      orderParams = [query, `${query}%`, `%${query}%`];
    }
    // If pos is provided, add POS filter
    if (posId) {
      whereClauses.push('pos_ids = ?');
      params.push(posId);
    }
    // If no query and no pos, return empty result (or optionally all words if dataset is small)
    if (whereClauses.length === 0) {
      // Option 1: Return all words (uncomment next two lines if dataset is small)
      // whereClauses.push('1'); // always true
      // params = [];
      // Option 2: Return empty result for large datasets
      return res.json({ data: [], pagination: { total: 0, page: Number(page), pageSize: limit, totalPages: 0 } });
    }
    // Count query
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM monbur_dic WHERE ${whereClauses.join(' AND ')}`,
      params
    );
    const total = countRows[0].total;

    // Data query
    let sql = `SELECT * FROM monbur_dic WHERE ${whereClauses.join(' AND ')}`;
    if (orderParams.length > 0) {
      sql += ` ORDER BY CASE WHEN mon_word = ? THEN 1 WHEN mon_word LIKE ? THEN 2 WHEN mon_word LIKE ? THEN 3 ELSE 4 END`;
    }
    sql += ` LIMIT ? OFFSET ?;`;
    const [rows] = await pool.execute(
      sql,
      [...params, ...orderParams, `${limit}`, `${offset}`]
    );

    res.json({
      data: rows,
      pagination: {
        total,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in paginated search:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = {
  searchWords,
  getWordById,
  addWord,
  updateWord,
  deleteWord,
  paginatedSearchWords,
};
