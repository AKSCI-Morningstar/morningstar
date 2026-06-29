/**
 * Risk Engine Client — calls the Python Causal Risk Engine microservice
 * with graceful JS fallback when Python is unavailable.
 */
const config = require('../utils/config');
const logger = require('../utils/logger');
const { simulateCascadingFailure } = require('../../simulation');
const backtest = require('./backtest');

const PY_HOST = config.simulation.host;
const PY_PORT = config.simulation.port;
const PY_BASE = `http://${PY_HOST}:${PY_PORT}`;

function httpPost(path, body, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const data = JSON.stringify(body);
    const r = http.request({
      hostname: PY_HOST, port: PY_PORT, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout,
    }, resp => {
      let bodyStr = '';
      resp.on('data', c => bodyStr += c);
      resp.on('end', () => { try { resolve(JSON.parse(bodyStr)); } catch { resolve(null); } });
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

function httpGet(path, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const r = http.get(`http://${PY_HOST}:${PY_PORT}${path}`, { timeout }, resp => {
      let body = '';
      resp.on('data', c => body += c);
      resp.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
    });
    r.on('error', reject);
  });
}

async function pythonHealth() {
  try {
    const result = await httpGet('/health', 5000);
    return result && result.status === 'ok';
  } catch { return false; }
}

async function simulate({ triggerNodeId, severity, duration, nIterations = 10000 }) {
  try {
    const pyResult = await httpPost('/simulate', {
      triggerNodeId, severity: severity || 0.8, duration: duration || 30, nIterations,
    }, 60000);
    if (pyResult && !pyResult.error) {
      const cal = backtest.calibrate({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 });
      pyResult.predictionAccuracy = { confidenceScore: cal.confidenceScore, similarEvents: cal.similarEvents, rationale: cal.rationale };
      return { ...pyResult, source: 'python-bayesian-monte-carlo' };
    }
  } catch (e) { logger.warn({ err: e.message }, 'Python risk engine unavailable, using JS fallback'); }

  const result = simulateCascadingFailure({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 });
  const cal = backtest.calibrate({ triggerNodeId, severity: severity || 0.8, duration: duration || 30 });
  result.predictionAccuracy = { confidenceScore: cal.confidenceScore, similarEvents: cal.similarEvents, rationale: cal.rationale };
  return { ...result, source: 'js-fallback' };
}

async function riskProfile({ nodeId, nodeType = 'supplier', nSamples = 10000 }) {
  try {
    const result = await httpPost('/risk-profile/node', { nodeId, nodeType, nSamples }, 30000);
    if (result && !result.error) return { ...result, source: 'python-bayesian' };
  } catch {}

  return { nodeId, nodeType, failureProbability: { p50: 0.5 }, source: 'js-fallback', recommendedActions: ['Unable to compute — Python engine unavailable'] };
}

async function networkRiskProfile() {
  try {
    const result = await httpPost('/risk-profile/network', {}, 60000);
    if (result && !result.error) return { ...result, source: 'python-bayesian' };
  } catch {}

  return { totalNodes: 0, profiles: [], source: 'js-fallback' };
}

async function propagateRisk({ triggerNodeId }) {
  try {
    const result = await httpPost('/propagation', { triggerNodeId, severity: 0.8, duration: 30 }, 30000);
    if (result && !result.error) return { ...result, source: 'python-bellman-ford' };
  } catch {}

  const store = require('../../data-store').getStore();
  const affected = store.graph.edges
    .filter(e => e.source === triggerNodeId)
    .map(e => ({ nodeId: e.target, cumulativeRisk: 50, nodeName: e.target.replace(/_t$/, '') }));
  return { source: triggerNodeId, totalReachable: affected.length, riskScores: affected, source: 'js-fallback' };
}

async function pythonBacktest({ triggerNodeId, severity, duration, actualImpact }) {
  try {
    const result = await httpPost('/backtest', { triggerNodeId, severity, duration, actualImpact }, 30000);
    if (result && !result.error) return { ...result, source: 'python' };
  } catch {}

  const backtestResult = backtest.runBacktest(triggerNodeId);
  return backtestResult || { error: 'No backtest data available', source: 'js-fallback' };
}

module.exports = {
  pythonHealth, simulate, riskProfile, networkRiskProfile, propagateRisk, pythonBacktest,
};
