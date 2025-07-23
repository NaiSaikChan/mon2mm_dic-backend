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
    const { mon_word, pronunciation, word_language_id, definitions, synonyms, category_id } = req.body;

    // Validate input
    if (!mon_word || !Array.isArray(definitions) || definitions.length === 0) {
        return res.status(400).json({ error: 'mon_word and at least one definition are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Insert into Word table
        const [wordResult] = await connection.execute(
            `INSERT INTO Word (word, pronunciation, language_id) VALUES (?, ?, ?)`,
            [mon_word, pronunciation, word_language_id]
        );
        const word_id = wordResult.insertId;

        // 2. Insert all definitions (array of objects)
        let definitionIds = [];
        if (definitions && Array.isArray(definitions)) {
            for (const def of definitions) {
                const { definition_text, example_text, definition_language_id, pos_id, category_id } = def;
                
                // Handle category_id properly - convert array to first element or null
                let processedCategoryId = category_id;
                if (Array.isArray(category_id)) {
                    processedCategoryId = category_id.length > 0 && category_id[0] !== null ? category_id[0] : null;
                }
                // Convert null, undefined, or empty string to null for database
                if (processedCategoryId === undefined || processedCategoryId === '' || processedCategoryId === 'null') {
                    processedCategoryId = null;
                }
                
                const [defResult] = await connection.execute(
                    `INSERT INTO Definition (word_id, definition, example, language_id, pos_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`,
                    [word_id, definition_text, example_text, definition_language_id, pos_id, processedCategoryId]
                );
                definitionIds.push(defResult.insertId);
            }
        }

        // 3. Insert synonyms (array of strings)
        if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
            const synonymValues = synonyms
                .filter(s => typeof s === 'string' && s.trim() !== '')
                .map(s => [word_id, word_language_id, s]);
            if (synonymValues.length > 0) {
                await connection.query(
                    `INSERT INTO Synonym (word_id, language_id, synonym) VALUES ?`,
                    [synonymValues]
                );
            }
        }

        await connection.commit();

        // 4. Return created word with definitions and synonyms
        const [rows] = await connection.query(
            `SELECT * FROM monburmese_dic
             WHERE word_id = ?`,
            [word_id]
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
        })
      );

        res.status(201).json({ message: 'Word, Definitions, and Synonyms added successfully', word_id, definition_ids: definitionIds, data: parsedRows });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding word:', error);
        res.status(500).json({ message: 'Failed to add word.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// *** Update an existing word and its definitions/synonyms (array-based logic) ***
const updateWord = async (req, res) => {
    const { id } = req.params;
    const { mon_word, pronunciation, word_language_id, definitions, synonyms, category_id } = req.body;

    // Validate input
    if (!mon_word || !Array.isArray(definitions) || definitions.length === 0) {
        return res.status(400).json({ error: 'mon_word and at least one definition are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Check if word exists
        const [wordRows] = await connection.execute(
            'SELECT * FROM Word WHERE word_id = ?',
            [id]
        );
        if (wordRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Word not found' });
        }

        // 2. Update main word fields
        await connection.execute(
            `UPDATE Word SET word = ?, pronunciation = ?, language_id = ? WHERE word_id = ?`,
            [mon_word, pronunciation, word_language_id, id]
        );


        // 3. Update or insert definitions (partial update logic)
        let definitionIds = [];
        for (const def of definitions) {
            const { definition_id, definition_text, example_text, definition_language_id, pos_id, category_id } = def;
            
            // Handle category_id properly - convert array to first element or null
            let processedCategoryId = category_id;
            if (Array.isArray(category_id)) {
                processedCategoryId = category_id.length > 0 && category_id[0] !== null ? category_id[0] : null;
            }
            // Convert null, undefined, or empty string to null for database
            if (processedCategoryId === undefined || processedCategoryId === '' || processedCategoryId === 'null') {
                processedCategoryId = null;
            }
            
            if (definition_id) {
                // Update existing definition
                await connection.execute(
                    `UPDATE Definition SET definition = ?, example = ?, language_id = ?, pos_id = ?, category_id = ? WHERE definition_id = ? AND word_id = ?`,
                    [definition_text, example_text, definition_language_id, pos_id, processedCategoryId, definition_id, id]
                );
                definitionIds.push(definition_id);
            } else {
                // Insert new definition
                const [defResult] = await connection.execute(
                    `INSERT INTO Definition (word_id, definition, example, language_id, pos_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`,
                    [id, definition_text, example_text, definition_language_id, pos_id, processedCategoryId]
                );
                definitionIds.push(defResult.insertId);
            }
        }

        // 4. Delete all old synonyms and insert new ones (still replace all synonyms)
        await connection.execute(`DELETE FROM Synonym WHERE word_id = ?`, [id]);
        if (synonyms && Array.isArray(synonyms) && synonyms.length > 0) {
            const synonymValues = synonyms
                .filter(s => typeof s === 'string' && s.trim() !== '')
                .map(s => [id, word_language_id, s]);
            if (synonymValues.length > 0) {
                await connection.query(
                    `INSERT INTO Synonym (word_id, language_id, synonym) VALUES ?`,
                    [synonymValues]
                );
            }
        }

        await connection.commit();

        // 6. Return updated word with definitions and synonyms
        const [rows] = await connection.query(
            `SELECT * FROM monburmese_dic
             WHERE word_id = ?`,
            [id]
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
        })
      );

        res.json({ message: 'Word, Definitions, and Synonyms updated successfully', word_id: id, definition_ids: definitionIds, data: parsedRows });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating word:', error);
        res.status(500).json({ message: 'Failed to update word.', error: error.message });
    } finally {
        if (connection) connection.release();
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

// Get random words for featured section
const getRandomWords = async (req, res) => {
  const count = Math.max(parseInt(req.query.count) || 3, 1);
  try {
    // Get total word count
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM monburmese_dic');
    const total = countRows[0].total;
    if (total === 0) return res.json([]);

    // Generate unique random IDs
    const ids = new Set();
    while (ids.size < count && ids.size < total) {
      ids.add(Math.floor(Math.random() * total) + 1);
    }
    const idList = Array.from(ids);
    if (idList.length === 0) return res.json([]);

    // Fetch words by IDs
    const [rows] = await pool.query(
      `SELECT * FROM monburmese_dic WHERE word_id IN (${idList.map(() => '?').join(',')})`,
      idList
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching random words:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get word of the day
const getWordOfTheDay = async (req, res) => {
  try {
    // Get total word count
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM monburmese_dic');
    const total = countRows[0].total;
    if (total === 0) return res.json({});

    // Use date as seed for deterministic word of the day
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const wordId = (seed % total) + 1;

    const [rows] = await pool.execute('SELECT * FROM monburmese_dic WHERE word_id = ?', [wordId]);
    if (rows.length === 0) return res.json({});
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching word of the day:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categoryhierarchy');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get categories organized in 2-level hierarchy
const getCategoriesHierarchy = async (req, res) => {
  try {
    // Get level 1 categories (parent categories)
    const [level1Rows] = await pool.execute(
      `SELECT category_id, en_category_name, mm_category_name, mon_category_name, parent_category_id, level 
       FROM categoryhierarchy
       WHERE level = 1
       ORDER BY parent_category_id`
    );

    // Get level 2 categories (child categories)
    const [level2Rows] = await pool.execute(
      `SELECT category_id, en_category_name, mm_category_name, mon_category_name, parent_category_id, level 
       FROM categoryhierarchy
       WHERE level = 2
       ORDER BY parent_category_id`
    );

    // Organize the data into hierarchy structure
    const categoryHierarchy = level1Rows.map(level1Category => ({
      ...level1Category,
      subcategories: level2Rows.filter(level2Category => 
        level2Category.parent_category_id === level1Category.category_id
      )
    }));

    res.json({
      categories: categoryHierarchy,
      meta: {
        level1Count: level1Rows.length,
        level2Count: level2Rows.length,
        totalCategories: level1Rows.length + level2Rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching categories hierarchy:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get words by category ID with pagination
const getWordsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, pageSize = 12, includeSubcategories = 'false' } = req.query;

  const limit = Math.max(parseInt(pageSize), 1);
  const offset = (Math.max(parseInt(page), 1) - 1) * limit;

  try {
    // First, get the category information
    const [categoryRows] = await pool.execute(
      `SELECT category_id, en_category_name, mm_category_name, mon_category_name, parent_category_id, level 
       FROM categoryhierarchy WHERE category_id = ?`,
      [categoryId]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const category = categoryRows[0];

    // Use JSON_CONTAINS to search within the category_id JSON array
    // Count total items
    const countSql = `SELECT COUNT(*) as total FROM monburmese_dic 
                      WHERE JSON_CONTAINS(category_id, '${categoryId}')`;
    const [countResult] = await pool.execute(countSql);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated words
    const dataSql = `SELECT * FROM monburmese_dic 
                     WHERE JSON_CONTAINS(category_id, '${categoryId}')
                     ORDER BY mon_word LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute(dataSql);

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
      },
      category
    });

  } catch (error) {
    console.error('Error fetching words by category:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Search words within a specific category
const searchWordsInCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { query, page = 1, pageSize = 12, searchFields = 'word,definitions' } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const limit = Math.max(parseInt(pageSize), 1);
  const offset = (Math.max(parseInt(page), 1) - 1) * limit;
  const fieldsArray = searchFields.split(',').map(field => field.trim());

  try {
    // First, get the category information
    const [categoryRows] = await pool.execute(
      `SELECT category_id, en_category_name, mm_category_name, mon_category_name, parent_category_id, level 
       FROM categoryhierarchy WHERE category_id = ?`,
      [categoryId]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const category = categoryRows[0];

    // Build search conditions based on searchFields
    let searchConditions = [];
    let searchParams = [];
    
    if (fieldsArray.includes('word')) {
      searchConditions.push('(mon_word = ? OR mon_word LIKE ? OR mon_word LIKE ?)');
      searchParams.push(query, `${query}%`, `%${query}%`);
    }
    
    if (fieldsArray.includes('definitions')) {
      searchConditions.push('definitions LIKE ?');
      searchParams.push(`%${query}%`);
    }

    if (searchConditions.length === 0) {
      return res.status(400).json({ message: 'Invalid search fields specified' });
    }

    const searchCondition = `(${searchConditions.join(' OR ')})`;
    
    // Build the complete WHERE clause using the Definition table approach
    const whereClause = `word_id IN (SELECT word_id FROM Definition WHERE category_id = ?) AND ${searchCondition}`;
    const allParams = [categoryId, ...searchParams];

    // Count total items
    const countSql = `SELECT COUNT(DISTINCT word_id) as total FROM monburmese_dic WHERE ${whereClause}`;
    const [countResult] = await pool.execute(countSql, allParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated search results without ordering
    const dataSql = `SELECT * FROM monburmese_dic WHERE ${whereClause} LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await pool.execute(dataSql, allParams);

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
      },
      category,
      searchQuery: query,
      searchFields: fieldsArray
    });

  } catch (error) {
    console.error('Error searching words in category:', error);
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
  getRandomWords,
  getWordOfTheDay,
  getCategories,
  getCategoriesHierarchy,
  getWordsByCategory,
  searchWordsInCategory,
};
