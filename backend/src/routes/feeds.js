const { Router } = require('express');
const mockFeeds = require('../services/mock-feeds');

const router = Router();

router.get('/status', (req, res) => res.json(mockFeeds.getFeedsSummary()));

router.post('/start', (req, res) => {
  const { feedId, intervalMs } = req.body;
  if (feedId) res.json(mockFeeds.startFeed(feedId, () => ({}), intervalMs || 120000));
  else res.json(mockFeeds.startAllFeeds());
});

router.post('/stop', (req, res) => {
  const { feedId } = req.body;
  if (feedId) res.json(mockFeeds.stopFeed(feedId));
  else res.json(mockFeeds.stopAllFeeds());
});

router.post('/ingest-demo', (req, res) => res.json(mockFeeds.ingestAllDemo()));

module.exports = router;