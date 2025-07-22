// app.js

require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT;

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
const cors = require('cors');
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// 3. API Routes တွေကို app မှာ Use လုပ်မယ်။
const wordsRoutes = require('./routes/wordsRoutes');
app.use('/api/words', wordsRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


const posRoutes = require('./routes/posRoutes');
app.use('/api/pos', posRoutes);

// Add categories routes
const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/api/categories', categoriesRoutes);

// Add favorites routes
const favoritesRoutes = require('./routes/favoritesRoutes');
app.use('/api/favorites', favoritesRoutes);

// Basic Route (optional - for testing if server is up)
app.get('/', (req, res) => {
  res.send('Hello from Mon Dictionary Backend!');
}); 

// Admin
const adminWordRoutes = require('./routes/adminWordRoutes');
app.use('/api/admin', adminWordRoutes);


if (require.main === module) {
  app.listen(port, () => {
    console.log(`Mon Dictionary Backend listening at http://localhost:${port}`);
    console.log('Server is running and ready for requests!');
  });
}