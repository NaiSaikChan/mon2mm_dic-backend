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
      `SELECT * FROM monburmese_dic WHERE
        mon_word = ? OR
        mon_word LIKE ? OR
        mon_word LIKE ? OR
        definitions LIKE ?
        ORDER BY CASE WHEN mon_word = ? THEN 1
          WHEN mon_word LIKE ? THEN 2
          WHEN mon_word LIKE ? THEN 3
        ELSE 4 END`,
      [query, `${query}%`, `%${query}%`,`%${query}%`, query, `${query}%`, `%${query}%`] // Note: parameters need to match your `LIKE` and exact match logic
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No matching words found.' });
    }

    // Parse JSON columns for each row
        const parsedRows = rows.map(row => ({
          ...row,
          pos_ids: uniqueArray(safeJsonParse(row.pos_ids)),
          pos_ENnames: uniqueArray(safeJsonParse(row.pos_ENnames)),
          pos_Mmnames: uniqueArray(safeJsonParse(row.pos_Mmnames)),
          synonyms_text: uniqueArray(safeJsonParse(row.synonyms_text)),
          definition_ids: uniqueArray(safeJsonParse(row.definition_ids)),
          definitions: uniqueArray(safeJsonParse(row.definitions)),
          examples: uniqueArray(safeJsonParse(row.examples)),
          category_id: uniqueArray(safeJsonParse(row.category_id))
        }));

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
        const [rows] = await pool.execute(
          `SELECT * FROM monburmese_dic WHERE word_id = ?`,
          [id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Word not found' });
        }

        // Parse JSON columns for each row
        const parsedRows = rows.map(row => ({
          ...row,
          word_id: uniqueArray(safeJsonParse(row.word_id)),
          mon_word: uniqueArray(safeJsonParse(row.mon_word)),
          pronunciation: uniqueArray(safeJsonParse(row.pronunciation)),
          pos_ids: uniqueArray(safeJsonParse(row.pos_ids)),
          pos_ENnames: uniqueArray(safeJsonParse(row.pos_ENnames)),
          pos_Mmnames: uniqueArray(safeJsonParse(row.pos_Mmnames)),
          synonyms_text: uniqueArray(safeJsonParse(row.synonyms_text)),
          definition_ids: uniqueArray(safeJsonParse(row.definition_ids)),
          definitions: uniqueArray(safeJsonParse(row.definitions)),
          examples: uniqueArray(safeJsonParse(row.examples)),
          category_id: uniqueArray(safeJsonParse(row.category_id))
        })
      );

        res.json(parsedRows);
    } catch (error) {
        console.error('Error fetching word by ID:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// *** Add a new word with its definition ***
const addWord = async (req, res) => {
    const { mon_word, pronunciation, word_language_id, definition_text, example_text, definition_language_id, pos_id, synonyms, category_id } = req.body;

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
            `INSERT INTO Definition (word_id, definition, example, language_id, pos_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [word_id, definition_text, example_text, definition_language_id, pos_id, category_id]
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
    const { mon_word, pronunciation, word_language_id, definition_text, example_text, definition_language_id, pos_id, definition_id, synonyms } = req.body;

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
            [definition_text, example_text, definition_language_id, pos_id, definition_id, id]
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
      whereClauses.push('(mon_word = ? OR mon_word LIKE ? OR mon_word LIKE ? OR definitions LIKE ?)');
      params.push(query, `${query}%`, `%${query}%`, `%${query}%`);
      orderParams = [query, `${query}%`, `%${query}%`];
    }
    // If pos is provided, add POS filter
    if (posId) {
      whereClauses.push('pos_ids LIKE ?');
      params.push(`%${posId}%`);
    }
    // If no query and no pos, return empty result (or optionally all words if dataset is small)
    if (whereClauses.length === 0) {
      return res.json({
        data: [],
        pagination: {
          currentPage: parseInt(page),
          pageSize: limit,
          totalItems: 0,
          totalPages: 0
        }
      });
    }

    // Count query for pagination
    const countSql = `SELECT COUNT(*) as total FROM monburmese_dic WHERE ${whereClauses.join(' AND ')}`;
    const [countResult] = await pool.execute(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Data query
    let sql = `SELECT * FROM monburmese_dic WHERE ${whereClauses.join(' AND ')}`;
    if (orderParams.length > 0) {
      sql += ` ORDER BY CASE WHEN mon_word = ? THEN 1 WHEN mon_word LIKE ? THEN 2 WHEN mon_word LIKE ? THEN 3 ELSE 4 END`;
    }
    sql += ` LIMIT ? OFFSET ?;`;
    const [rows] = await pool.execute(
      sql,
      [...params, ...orderParams, `${limit}`, `${offset}`]
    );

    // Parse JSON columns for each row
    const parsedRows = rows.map(row => ({
      ...row,
      word_id: uniqueArray(safeJsonParse(row.word_id)),
      mon_word: uniqueArray(safeJsonParse(row.mon_word)),
      pronunciation: uniqueArray(safeJsonParse(row.pronunciation)),
      pos_ids: uniqueArray(safeJsonParse(row.pos_ids)),
      pos_ENnames: uniqueArray(safeJsonParse(row.pos_ENnames)),
      pos_Mmnames: uniqueArray(safeJsonParse(row.pos_Mmnames)),
      synonyms_text: uniqueArray(safeJsonParse(row.synonyms_text)),
      definition_ids: uniqueArray(safeJsonParse(row.definition_ids)),
      definitions: uniqueArray(safeJsonParse(row.definitions)),
      examples: uniqueArray(safeJsonParse(row.examples)),
      category_id: uniqueArray(safeJsonParse(row.category_id))
    }));

    res.json({
      data: parsedRows,
      pagination: {
        currentPage: parseInt(page),
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPreviousPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error in paginated search:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

function safeJsonParse(val) {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return val; // Already parsed
  try {
    return JSON.parse(val);
  } catch {
    return val; // Return as-is if not valid JSON
  }
}

function uniqueArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return [...new Set(arr)];
}

module.exports = {
  searchWords,
  getWordById,
  addWord,
  updateWord,
  deleteWord,
  paginatedSearchWords,
};
