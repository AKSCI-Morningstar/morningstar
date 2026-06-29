const { Router } = require('express');
const recon = require('../services/data-reconciliation');
const dataStore = require('../../data-store');

const router = Router();

router.post('/ingest', (req, res) => {
  const { source, records, fieldMap } = req.body;
  if (!source || !records) return res.status(400).json({ error: 'source and records required' });
  const result = recon.reconcileSource(source, records, fieldMap || {});
  res.json(result);
});

router.get('/entities', (req, res) => {
  const threshold = parseFloat(req.query.threshold) || 0.85;
  res.json({ results: recon.resolveEntities(threshold) });
});

router.post('/etl', (req, res) => {
  const { source, data } = req.body;
  if (!source || !data) return res.status(400).json({ error: 'source and data required' });
  const result = recon.etlPipeline(source, data);
  res.json(result);
});

router.get('/status', (req, res) => {
  const store = dataStore.getStore();
  res.json({ nodeCount: store.graph.nodes.length, edgeCount: store.graph.edges.length, reconciliationLog: (store.reconciliationLog || []).slice(-20) });
});

module.exports = router;