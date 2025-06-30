// app.js

require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

// routes folder ကနေ wordsRoutes ကို Import လုပ်မယ်။
// Note: wordsRoutes ကို app.js မှာ app.use() နဲ့ သုံးဖို့ပဲ Import လုပ်ထားရမယ်။
// Database connection pool ကို တခြားဖိုင်တွေကနေ လွယ်လွယ်ကူကူ Import လုပ်နိုင်အောင်
// app.js ကနေပဲ Export လုပ်ပါမယ်။
// const wordsRoutes = require('./routes/wordsRoutes'); // ဒီလိုင်းကို ခဏဖယ်ထားပါမယ်။ အောက်မှာ ပြန်ထည့်ပါမယ်။

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

// Pool object ကို module.exports ကနေ export လုပ်ပါမယ်။
// ဒါမှ controllers/wordsController.js ကနေ require() နဲ့ တိုက်ရိုက်ရယူနိုင်မှာပါ။
// *** NEW CHANGE HERE ***
module.exports = {
    app, // Express app instance
    pool // Database connection pool
};

// Middleware တွေ ထည့်သွင်းခြင်း။ (JSON request body တွေကို parse လုပ်နိုင်ဖို့)
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// 3. API Routes တွေကို app မှာ Use လုပ်မယ်။
// routes folder ကနေ wordsRoutes ကို Import လုပ်ပြီး app.use() လုပ်မယ်။
const wordsRoutes = require('./routes/wordsRoutes'); // *** MOVED HERE ***
app.use('/api/words', wordsRoutes);


// Basic Route (optional - for testing if server is up)
app.get('/', (req, res) => {
  res.send('Hello from Mon Dictionary Backend!');
});

const cors = require('cors');
// ...
app.use(cors()); // Allow all origins for now (for development)
// Production မှာတော့ သင့်ရဲ့ Frontend Domain တွေကိုပဲ ခွင့်ပြုဖို့ လိုပါမယ်။
// app.use(cors({ origin: ['http://localhost:8080', 'https://yourwebsite.com'] }));

// Server ကို Start လုပ်ခြင်း။
// app.js ကို direct run တာမဟုတ်ဘဲ, တခြား module ကနေ require လုပ်တဲ့အခါ app.listen မ run စေချင်တဲ့အတွက်
// ဒီ listen logic ကို if condition ထဲ ထည့်ပါမယ်။
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Mon Dictionary Backend listening at http://localhost:${port}`);
    console.log('Server is running and ready for requests!');
  });
}