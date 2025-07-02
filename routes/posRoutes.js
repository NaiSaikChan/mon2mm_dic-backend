// routes/posRoutes.js

const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');

// Define route for fetching Part of Speeches
router.get('/', posController.getPartOfSpeeches);

module.exports = router;