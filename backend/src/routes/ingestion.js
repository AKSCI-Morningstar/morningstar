const { Router } = require('express');
const ingestion = require('../services/ingestion');
const { broadcast } = require('./websocket');

const router = Router();

router.post('/spire', async (req, res) => {
  const r = await ingestion.ingestSPIRE(req.body.contracts);
  if (r.success) broadcast('feed:update', { feed: 'spire', recordCount: r.recordsIngested });
  res.json(r);
});

router.post('/sam', async (req, res) => {
  const r = await ingestion.ingestSAM(req.body.entities);
  if (r.success) broadcast('feed:update', { feed: 'sam', recordCount: r.recordsIngested });
  res.json(r);
});

router.post('/dnb', async (req, res) => {
  const r = await ingestion.ingestDNB(req.body.reports);
  if (r.success) broadcast('feed:update', { feed: 'dnb', recordCount: r.recordsIngested });
  res.json(r);
});

router.get('/status', (req, res) => res.json(ingestion.getFeedStatus()));

router.post('/ingest-demo', async (req, res) => {
  const demo = ingestion.generateDemoData();
  const results = [];
  results.push(await ingestion.ingestSPIRE(demo.spire));
  results.push(await ingestion.ingestSAM(demo.sam));
  results.push(await ingestion.ingestDNB(demo.dnb));
  res.json({ success: true, results });
});

module.exports = router;
