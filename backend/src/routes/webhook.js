const { Router } = require('express');
const ingestion = require('../services/ingestion');

const router = Router();

router.post('/feed', async (req, res) => {
  const { source, records } = req.body;
  if (!source || !records) return res.status(400).json({ error: 'source and records required' });

  const handlers = { spire: ingestion.ingestSPIRE, sam: ingestion.ingestSAM, dnb: ingestion.ingestDNB };
  const handler = handlers[source];
  if (!handler) return res.status(400).json({ error: `Unknown source: ${source}` });

  res.json(await handler(records));
});

module.exports = router;
