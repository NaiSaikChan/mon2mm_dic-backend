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
      `SELECT * FROM mon2mm_dictionary WHERE
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
    const { id } = req.params;
    try {
        // Fetch from the updated mon2mm_dictionary view
        // IMPORTANT: The new view will group definitions.
        // For 'getWordById', you might want to fetch *all* definitions for that word,
        // or just the first one for simple editing purposes.
        // For now, we'll fetch all grouped data and take the first definition's pos_id for the form.
        const [rows] = await pool.execute(
            `SELECT
                word_id, mon_word, pronunciation, word_language_id,
                definition, example, definition_language_ids, pos_ids, -- Take the first pos_id from grouped
                pos_ENnames, pos_Mmnames
             FROM mon2mm_dictionary WHERE word_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }

        const word = rows[0];
        // For the edit form, we need a single pos_id and definition_id.
        // Assuming the first one from the grouped list for now for simplicity in the form.
        // You might need to split `pos_ids` string and take the first one or manage multiple.
        // For this simple form, we'll take the first pos_id and first definition text.
        const definition_ids_array = word.definition_ids ? word.definition_ids.split(',').map(Number) : [];
        const pos_ids_array = word.pos_ids ? word.pos_ids.split(',').map(Number) : [];
        const definitions_array = word.definition ? word.definition.split('\n') : [];
        const examples_array = word.example ? word.example.split('\n') : [];

        res.json({
            word_id: word.word_id,
            mon_word: word.mon_word,
            pronunciation: word.pronunciation,
            word_language_id: word.word_language_id,
            // For editing, we pick the first definition's ID, text, example, and POS ID
            definition_id: definition_ids_array[0] || null, // Assuming you have definition_id in the view
            definition: definitions_array[0] || '',
            example: examples_array[0] || '',
            definition_language_id: word.definition_language_ids ? word.definition_language_ids.split(',').map(Number)[0] : null,
            pos_id: pos_ids_array[0] || null, // Pick the first POS ID for the form
            pos_ENnames: word.pos_ENnames, // Still useful for display
            pos_Mmnames: word.pos_Mmnames  // Still useful for display
        });

    } catch (error) {
        console.error('Error fetching word by ID:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// *** Add a new word with its definition ***
const addWord = async (req, res) => {
  // Request Body ကနေ Data တွေကို ရယူမယ်။
  // JSON format နဲ့ ပို့လာမယ့် Data တွေက အောက်ပါအတိုင်း ဖြစ်မယ်လို့ မျှော်လင့်ပါတယ်။

  const { mon_word, pronunciation, word_language_id, definition_language_id, definition_text, example_text, pos_id } = req.body;

  // Input Validation (အခြေခံ စစ်ဆေးမှု)
  if (!mon_word || !definition_text || !word_language_id || !definition_language_id || !pos_id) {
    return res.status(400).json({ message: 'Missing required fields: mon_word, definition_text, word_language_id, definition_language_id, pos_id.' });
  }

  let connection; // Transaction အတွက် connection object ကို ထိန်းသိမ်းထားဖို့
  try {
    connection = await pool.getConnection(); // Connection Pool ကနေ Connection တစ်ခု ယူမယ်။
    await connection.beginTransaction(); // Transaction စတင်မယ်။ (Error တခုခုဖြစ်ရင် အကုန်လုံး Cancel လုပ်ဖို့)

    // 1. Add the word to the 'Word' table
    const [wordResult] = await connection.execute(
      `INSERT INTO Word (word, pronunciation, language_id, created_at) VALUES (?, ?, ?, NOW())`,
      [mon_word, pronunciation, word_language_id]
    );
    const newWordId = wordResult.insertId; // Insert လုပ်လိုက်တဲ့ Word ရဲ့ ID ကို ရယူမယ်။

    // 2. Add the definition to the 'Definition' table
    await connection.execute(
      `INSERT INTO Definition (word_id, language_id, pos_id, definition, example, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [newWordId, definition_language_id, pos_id, definition_text, example_text]
    );

    // If everything is successful, commit the transaction
    await connection.commit(); // Transaction ကို အတည်ပြုမယ်။

    res.status(201).json({ message: 'Word added successfully!', word_id: newWordId });

  } catch (error) {
    if (connection) {
      await connection.rollback(); // Error ဖြစ်ရင် Transaction ကို ပြန်လည်ရုပ်သိမ်းမယ် (undo all changes)
    }
    console.error('Error adding new word:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    if (connection) {
      connection.release(); // Connection ကို ပြန်လွှတ်ပေးမယ်။
    }
  }
};


// *** NEW FUNCTION: Update an existing word and its definition ***
const updateWord = async (req, res) => {
  const { id } = req.params; // URL parameter ကနေ Word ID ကို ရယူမယ်။
  const { mon_word, pronunciation, word_language_id, definition_text, example_text, definition_language_id, pos_id } = req.body;

  // Input Validation (အခြေခံ စစ်ဆေးမှု)
  if (!mon_word || !definition_text || !word_language_id || !definition_language_id || !pos_id) {
    return res.status(400).json({ message: 'Missing required fields for update.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Update the 'Word' table
    // အရင်ဆုံး Word Table ထဲမှာ ရှိမရှိ စစ်ဆေးပြီးမှ Update လုပ်တာ ပိုကောင်းပါတယ်။
    const [wordUpdateResult] = await connection.execute(
      `UPDATE Word SET word = ?, pronunciation = ?, language_id = ? WHERE word_id = ?`,
      [mon_word, pronunciation, word_language_id, id]
    );

    if (wordUpdateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: `Word with ID ${id} not found.` });
    }

    // 2. Update the corresponding 'Definition' in the 'Definition' table
    // (This assumes one definition per word for simplicity. If a word can have multiple definitions,
    // you'd need to handle definition_id in the request body or update based on word_id and other criteria.)
    const [definitionUpdateResult] = await connection.execute(
      `UPDATE Definition SET definition = ?, example = ?, language_id = ?, pos_id = ? WHERE word_id = ?`,
      [definition_text, example_text, definition_language_id, pos_id, id]
    );

    // Note: If a word might not have a definition, or might have multiple, this logic needs refinement.
    // For now, we assume there's at least one definition linked to the word for update.
    if (definitionUpdateResult.affectedRows === 0) {
        // This might happen if the definition record wasn't found for the given word_id.
        // You might decide to rollback, or just log a warning depending on your exact requirements.
        // For strict integrity, rolling back is safer if definition update is critical.
        await connection.rollback(); // Rollback if definition update fails
        return res.status(404).json({ message: `Definition for word ID ${id} not found or no changes made.` });
    }


    await connection.commit();
    res.json({ message: `Word with ID ${id} and its definition updated successfully!` });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating word:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
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
  // Good: Default values for page and pageSize in destructuring.
  const { query, page = 1, pageSize = 20 } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  // Good: Ensures page and pageSize are valid positive integers.
  const limit = Math.max(parseInt(pageSize), 1);
  const offset = (Math.max(parseInt(page), 1) - 1) * limit;

  try {
    // Get total count for pagination
    // Good: Correctly gets total count.
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM mon2mm_dictionary WHERE mon_word LIKE ? OR definition LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );
    const total = countRows[0].total;

    // Get paginated results (limit/offset as literals)
    // NOTE: SQL Injection Vulnerability due to string interpolation for LIMIT/OFFSET
    const sql = `
      SELECT * FROM mon2mm_dictionary WHERE
        mon_word = ? OR
        mon_word LIKE ? OR
        mon_word LIKE ? OR
        definition LIKE ?
        ORDER BY CASE WHEN mon_word = ? THEN 1
          WHEN mon_word LIKE ? THEN 2
          WHEN mon_word LIKE ? THEN 3
        ELSE 4 END
        LIMIT ? OFFSET ?;
    `;
    // Good: Correct number of parameters for the WHERE and ORDER BY clauses.
    const [rows] = await pool.execute(
      sql,
      [ query, `${query}%`, `%${query}%`, `%${query}%`, query, `${query}%`, `%${query}%`, `${limit}`, `${offset}`]
    );

    res.json({
      data: rows,
      pagination: {
        total,
        page: Number(page), // Good: Ensuring page is a Number for the response.
        pageSize: limit,    // Good: Using 'limit' for clarity.
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
