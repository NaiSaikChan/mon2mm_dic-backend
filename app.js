// app.js

require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

// Database Connection Pool ဖန်တီးခြင်း။
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database Connection ကို စစ်ဆေးခြင်း။
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database!');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err.message);
    process.exit(1);
  });


module.exports = {
    app, // Express app instance
    pool // Database connection pool
};

// Middleware တွေ ထည့်သွင်းခြင်း။ (JSON request body တွေကို parse လုပ်နိုင်ဖို့)
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// 3. API Routes တွေကို app မှာ Use လုပ်မယ်။
const wordsRoutes = require('./routes/wordsRoutes');
app.use('/api/words', wordsRoutes);


// Basic Route (optional - for testing if server is up)
app.get('/', (req, res) => {
  res.send('Hello from Mon Dictionary Backend!');
});

const cors = require('cors');
app.use(cors()); 

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Mon Dictionary Backend listening at http://localhost:${port}`);
    console.log('Server is running and ready for requests!');
  });
}