const { Router } = require('express');
const edgesModel = require('../models/edges');
const dataStore = require('../../data-store');

const router = Router();

router.get('/state', async (req, res) => {
  const graph = await edgesModel.getGraph();
  res.json(graph);
});

router.get('/data', async (req, res) => {
  res.json(dataStore.getStore().graph);
});

module.exports = router;
