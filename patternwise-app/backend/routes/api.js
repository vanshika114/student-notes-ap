const express = require('express');
const router = express.Router();
const patternController = require('../controllers/patternController');

// Get all patterns summary
router.get('/patterns', patternController.getPatterns);

// Get specific pattern details including LeetCode problem stats
router.get('/patterns/:id', patternController.getPatternDetails);

module.exports = router;
