const dataStore = require('../../data-store');
const logger = require('../utils/logger');

function recordSnapshot() {
  const store = dataStore.getStore();
  const snapshot = {
    timestamp: new Date().toISOString(),
    nodes: store.graph.nodes.map(n => ({ id: n.id, name: n.name, type: n.type, attributes: { ...n.attributes }, risk: n.attributes?.risk || 0 })),
    edges: store.graph.edges.map(e => ({ ...e })),
    resilienceScore: store.simulations?.[store.simulations.length - 1]?.resilienceScore || null,
  };
  const temporal = dataStore.getStore().temporal || [];
  temporal.push(snapshot);
  if (temporal.length > 1000) temporal.splice(0, temporal.length - 1000);
  dataStore.setStoreField('temporal', temporal);
  return snapshot;
}

function getHistory(nodeId, limit = 30) {
  const temporal = dataStore.getStore().temporal || [];
  return temporal.slice(-limit).map(s => {
    const node = (s.nodes || []).find(n => n.id === nodeId);
    return {
      timestamp: s.timestamp,
      risk: node?.risk || null,
      attributes: node?.attributes || null,
      resilienceScore: s.resilienceScore,
    };
  });
}

function getNodeTrend(nodeId) {
  const history = getHistory(nodeId, 20);
  if (history.length < 2) return { trend: 'insufficient_data', direction: 'stable', change: 0 };

  const firstRisk = history.find(h => h.risk !== null);
  const lastRisk = history.reverse().find(h => h.risk !== null);
  if (!firstRisk || !lastRisk) return { trend: 'no_risk_data', direction: 'stable', change: 0 };

  const change = lastRisk.risk - firstRisk.risk;
  const direction = change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable';
  const rollingAvg = history.filter(h => h.risk !== null).reduce((s, h, i, a) => s + h.risk / a.length, 0);

  return {
    trend: history.length >= 10 ? 'reliable' : 'emerging',
    direction,
    change: Math.round(change),
    currentRisk: lastRisk.risk,
    rollingAvgRisk: Math.round(rollingAvg),
    dataPoints: history.length,
  };
}

function getNetworkTrend() {
  const temporal = dataStore.getStore().temporal || [];
  if (temporal.length < 2) return { trend: 'insufficient_data' };

  const scores = temporal.map(s => s.resilienceScore).filter(Boolean);
  if (scores.length < 2) return { trend: 'no_resilience_data' };

  const first = scores[0];
  const last = scores[scores.length - 1];
  const change = last - first;
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  return {
    trend: scores.length >= 5 ? 'reliable' : 'emerging',
    direction: change > 3 ? 'improving' : change < -3 ? 'declining' : 'stable',
    change: Math.round(change),
    currentResilience: last,
    averageResilience: avg,
    minResilience: Math.min(...scores),
    maxResilience: Math.max(...scores),
    dataPoints: scores.length,
  };
}

function getRollingAverage(nodeId, key, window = 5) {
  const history = getHistory(nodeId, window);
  const values = history.map(h => h.attributes?.[key]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

function getTimeSeries(nodeId, metric, startDate, endDate) {
  const temporal = dataStore.getStore().temporal || [];
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();

  return temporal
    .filter(s => {
      const t = new Date(s.timestamp);
      return t >= start && t <= end;
    })
    .map(s => {
      const node = (s.nodes || []).find(n => n.id === nodeId);
      return {
        timestamp: s.timestamp,
        value: metric === 'risk' ? node?.risk : node?.attributes?.[metric],
      };
    })
    .filter(p => p.value !== null && p.value !== undefined);
}

module.exports = { recordSnapshot, getHistory, getNodeTrend, getNetworkTrend, getRollingAverage, getTimeSeries };