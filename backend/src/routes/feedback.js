const { Router } = require('express');
const feedbackModel = require('../models/feedback');

const router = Router();

router.post('/recommendation', async (req, res) => {
  const { query, answer, confidence, userFollowed } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });
  res.json(await feedbackModel.logRecommendation(query, answer, confidence, userFollowed));
});

router.post('/outcome', async (req, res) => {
  const { recommendationId, onTimeDelivery, costVariance, qualityScore, notes } = req.body;
  res.json(await feedbackModel.logOutcome(recommendationId || 'unknown', { onTimeDelivery, costVariance, qualityScore, notes }));
});

router.get('/recommendations', async (req, res) => {
  res.json(await feedbackModel.getRecommendations());
});

module.exports = router;
