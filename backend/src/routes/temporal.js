const { Router } = require('express');
const temporal = require('../services/temporal-store');

const router = Router();

router.post('/snapshot', (req, res) => {
  res.json(temporal.recordSnapshot());
});

router.get('/node/:nodeId', (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  res.json({ history: temporal.getHistory(req.params.nodeId, limit), trends: temporal.getNodeTrend(req.params.nodeId) });
});

router.get('/node/:nodeId/trend', (req, res) => {
  res.json(temporal.getNodeTrend(req.params.nodeId));
});

router.get('/network/trend', (req, res) => {
  res.json(temporal.getNetworkTrend());
});

router.get('/node/:nodeId/timeseries', (req, res) => {
  const { metric, startDate, endDate } = req.query;
  res.json({ data: temporal.getTimeSeries(req.params.nodeId, metric || 'risk', startDate, endDate) });
});

router.get('/node/:nodeId/rolling-average', (req, res) => {
  const key = req.query.key || 'risk';
  const window = parseInt(req.query.window) || 5;
  res.json({ value: temporal.getRollingAverage(req.params.nodeId, key, window), key, window });
});

module.exports = router;