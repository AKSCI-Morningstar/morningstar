const express = require('express');
const router = express.Router();
const dataStore = require('../../data-store');
const logger = require('../utils/logger');

router.post('/config', (req, res) => {
  try {
    const { company, user, erp, programs, suppliers, painPoints } = req.body;
    if (!company || !company.name) return res.status(400).json({ error: 'Company name is required' });
    const store = dataStore.getStore();
    store.deployment = { company, user, erp, programs, suppliers, painPoints, deployedAt: new Date().toISOString() };
    dataStore.save();
    logger.info({ company: company.name }, 'Deployment config saved');
    res.json({ status: 'ok', deployedAt: store.deployment.deployedAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/config', (req, res) => {
  const store = dataStore.getStore();
  if (store.deployment) return res.json({ status: 'ok', config: store.deployment });
  res.json({ status: 'ok', config: null });
});

router.get('/status', (req, res) => {
  const store = dataStore.getStore();
  res.json({ status: 'ok', deployed: !!store.deployment, deployedAt: store.deployment?.deployedAt || null });
});

router.post('/reset', (req, res) => {
  const store = dataStore.getStore();
  delete store.deployment;
  dataStore.save();
  res.json({ status: 'ok', deployed: false });
});

module.exports = router;
