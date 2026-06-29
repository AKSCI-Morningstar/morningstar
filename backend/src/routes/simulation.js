const { Router } = require('express');
const config = require('../utils/config');
const logger = require('../utils/logger');
const { broadcast } = require('./websocket');
const dataStore = require('../../data-store');
const backtest = require('../services/backtest');
const riskEngine = require('../services/risk-engine');

const router = Router();

router.post('/run', async (req, res) => {
  const { triggerNodeId, severity, duration, scenarios, nIterations } = req.body;

  try {
    let result;
    if (scenarios && Array.isArray(scenarios)) {
      const results = await Promise.all(scenarios.map(s =>
        riskEngine.simulate({ triggerNodeId: s.triggerNodeId, severity: s.severity, duration: s.duration, nIterations })
      ));
      const avgRes = Math.round(results.reduce((s, r) => s + (r.resilienceScore || 0), 0) / Math.max(1, results.length));
      result = {
        scenarios: results,
        aggregateResilience: avgRes,
        totalFinancialExposure: results.reduce((s, r) => s + (r.totalFinancialImpact?.mean || r.totalFinancialImpact || 0), 0),
        worstCase: results.sort((a, b) => (b.totalFinancialImpact?.mean || b.totalFinancialImpact || 0) - (a.totalFinancialImpact?.mean || a.totalFinancialImpact || 0))[0] || null,
      };
    } else if (triggerNodeId) {
      result = await riskEngine.simulate({ triggerNodeId, severity: severity || 0.8, duration: duration || 30, nIterations });
    } else {
      return res.status(400).json({ error: 'Provide triggerNodeId or scenarios' });
    }

    dataStore.logSimulation(req.body, result);
    broadcast('simulation:complete', result);
    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Simulation failed');
    res.status(500).json({ error: err.message });
  }
});

router.post('/run/deterministic', async (req, res) => {
  const { triggerNodeId, severity, duration } = req.body;
  if (!triggerNodeId) return res.status(400).json({ error: 'triggerNodeId required' });

  try {
    const http = require('http');
    const data = JSON.stringify({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 });
    const pyResult = await new Promise((resolve) => {
      const r = http.request({
        hostname: config.simulation.host, port: config.simulation.port, path: '/simulate/fast', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: 15000,
      }, resp => { let b = ''; resp.on('data', c => b += c); resp.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } }); });
      r.on('error', () => resolve(null));
      r.write(data);
      r.end();
    });

    if (pyResult) { broadcast('simulation:complete', pyResult); return res.json({ ...pyResult, engine: 'python-bellman-ford' }); }
  } catch { /* fallback */ }

  const { simulateCascadingFailure } = require('../../simulation');
  const result = simulateCascadingFailure({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 });
  const cal = backtest.calibrate({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 });
  result.predictionAccuracy = { confidenceScore: cal.confidenceScore, similarEvents: cal.similarEvents, rationale: cal.rationale };
  broadcast('simulation:complete', result);
  res.json(result);
});

router.get('/history', (req, res) => {
  res.json({ simulations: dataStore.getStore().simulations.slice(-20) });
});

// ── Back-testing ─────────────────────────────────────────────────────────

router.post('/backtest/:eventId', async (req, res) => {
  const result = backtest.runBacktest(req.params.eventId);
  if (result.error) return res.status(404).json(result);
  // Try to enhance with Python engine
  try {
    const http = require('http');
    const event = (dataStore.getStore().historicalDisruptions || []).find(e => e.id === req.params.eventId);
    if (event) {
      const data = JSON.stringify({ triggerNodeId: event.triggerNodeId, severity: event.severity, duration: event.duration, actualImpact: event.actualImpact });
      const pyResult = await new Promise((resolve) => {
        const r = http.request({
          hostname: config.simulation.host, port: config.simulation.port, path: '/backtest', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
          timeout: 30000,
        }, resp => { let b = ''; resp.on('data', c => b += c); resp.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } }); });
        r.on('error', () => resolve(null));
        r.write(data);
        r.end();
      });
      if (pyResult) return res.json({ ...pyResult, source: 'python-bayesian' });
    }
  } catch { /* fallback to JS */ }
  res.json(result);
});

router.get('/backtest/all', (req, res) => {
  res.json({ results: backtest.runAllBacktests() });
});

router.get('/accuracy', (req, res) => {
  res.json(backtest.getHistoricalAccuracySummary());
});

router.post('/calibrate', (req, res) => {
  const { triggerNodeId, severity, duration } = req.body;
  if (!triggerNodeId) return res.status(400).json({ error: 'triggerNodeId required' });
  res.json(backtest.calibrate({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 }));
});

// ── Risk Profiles ────────────────────────────────────────────────────────

router.post('/risk-profile/node', async (req, res) => {
  const { nodeId, nodeType = 'supplier', nSamples = 10000 } = req.body;
  if (!nodeId) return res.status(400).json({ error: 'nodeId required' });
  const result = await riskEngine.riskProfile({ nodeId, nodeType, nSamples });
  res.json(result);
});

router.post('/risk-profile/network', async (req, res) => {
  const result = await riskEngine.networkRiskProfile();
  res.json(result);
});

router.post('/propagation', async (req, res) => {
  const { triggerNodeId } = req.body;
  if (!triggerNodeId) return res.status(400).json({ error: 'triggerNodeId required' });
  const result = await riskEngine.propagateRisk({ triggerNodeId });
  res.json(result);
});

// ── Python proxy (legacy) ────────────────────────────────────────────────

router.post('/python-run', async (req, res) => {
  const result = await riskEngine.simulate({
    triggerNodeId: req.body.triggerNodeId || 'StellarMet_t',
    severity: req.body.severity,
    duration: req.body.duration,
  });
  broadcast('simulation:complete', result);
  res.json(result);
});

module.exports = router;
