const express = require('express');
const { generateAI, getAIHistory, getAIUsage } = require('../controllers/aiController');

const router = express.Router();

router.post('/generate', generateAI);
router.get('/history', getAIHistory);
router.get('/usage', getAIUsage);

module.exports = router;