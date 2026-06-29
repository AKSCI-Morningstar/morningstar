const { Router } = require('express');
const { answerQuery } = require('../services/rag');
const feedbackModel = require('../models/feedback');
const logger = require('../utils/logger');
const { broadcast } = require('./websocket');

const router = Router();

router.post('/', async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) return res.status(400).json({ error: 'query is required' });

  try {
    const result = await answerQuery(query);
    feedbackModel.logRecommendation(query, result.answer, result.confidence, null);
    broadcast('nlq:result', { query: result.query, answer: result.answer, relevantNodes: result.relevantNodes, confidence: result.confidence });
    res.json(result);
  } catch (err) {
    logger.error({ err }, 'NLQ failed');
    res.status(500).json({ error: 'NLQ processing failed', answer: 'Error processing query.', confidence: 0, provider: 'error' });
  }
});

module.exports = router;
