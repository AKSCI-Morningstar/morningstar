// Macro Intelligence — proxy to Python risk engine + local cache
const express = require('express');
const router = express.Router();
const http = require('http');
const config = require('../utils/config');
const logger = require('../utils/logger');

const SIM_HOST = config.simulation.host;
const SIM_PORT = config.simulation.port;

function proxyToPython(req, res, path) {
  const options = {
    hostname: SIM_HOST,
    port: SIM_PORT,
    path: `/macro/${path}`,
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  };
  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => (data += chunk));
    proxyRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch {
        res.status(502).json({ error: 'Invalid response from risk engine', raw: data });
      }
    });
  });
  proxyReq.on('error', (e) => {
    logger.warn({ err: e.message, path }, 'Macro proxy failed');
    // Return cached/demo data as fallback
    const fallbacks = {
      commodities: { status: 'fallback', commodities: [], count: 0 },
      energy: { status: 'fallback', energy: [], count: 0 },
      borders: { status: 'fallback', borders: [], count: 0 },
      ports: { status: 'fallback', ports: [], count: 0 },
      composite: { status: 'fallback', score: { composite: 50, material: 50, logistics: 50, manufacturing: 50, geopolitical: 50, trend: 'stable' }, history: [] },
      recommendations: { status: 'fallback', score: { composite: 50 }, recommendations: [{ action: 'FALLBACK', priority: 'info', message: 'Backend unavailable — using cached data' }] },
    };
    const fallback = fallbacks[path.replace(/\/$/, '')] || { status: 'fallback', error: 'Backend unavailable' };
    res.json(fallback);
  });
  if (req.body && Object.keys(req.body).length) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
}

router.get('/commodities', (req, res) => proxyToPython(req, res, 'commodities'));
router.get('/energy', (req, res) => proxyToPython(req, res, 'energy'));
router.get('/borders', (req, res) => proxyToPython(req, res, 'borders'));
router.get('/ports', (req, res) => proxyToPython(req, res, 'ports'));
router.get('/composite', (req, res) => proxyToPython(req, res, 'composite'));
router.post('/refresh', (req, res) => proxyToPython(req, res, 'refresh'));
router.get('/recommendations', (req, res) => proxyToPython(req, res, 'recommendations'));
router.post('/scheduler/start', (req, res) => proxyToPython(req, res, 'scheduler/start'));

module.exports = router;