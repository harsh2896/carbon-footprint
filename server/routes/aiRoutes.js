const express = require('express');
const {
  askLearn,
  generateAISuggestions,
  getFact,
  summarizeLearnResponse,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/ask', askLearn);
router.post('/summarize', summarizeLearnResponse);
router.get('/facts', getFact);
router.post('/ai-suggestions', generateAISuggestions);

module.exports = router;
