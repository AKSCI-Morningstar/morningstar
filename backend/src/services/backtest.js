const dataStore = require('../../data-store');
const { simulateCascadingFailure } = require('../../simulation');
const logger = require('../utils/logger');

dataStore.load();

function computeMape(predicted, actual) {
  const denom = Math.max(1, Math.abs(actual));
  return Math.abs(predicted - actual) / denom;
}

function accuracyFromMape(mape) {
  return Math.max(0, Math.round((1 - Math.min(1, mape)) * 100));
}

function replayEvent(event) {
  return simulateCascadingFailure({
    triggerNodeId: event.triggerNodeId,
    severity: event.severity,
    duration: event.duration,
  });
}

function computeAccuracyMetrics(event) {
  const predicted = event.predictedImpact;
  const actual = event.actualImpact;

  const metrics = [
    { key: 'affectedNodes', label: 'Affected Nodes', weight: 0.15 },
    { key: 'criticalCount', label: 'Critical Count', weight: 0.20 },
    { key: 'warningCount', label: 'Warning Count', weight: 0.10 },
    { key: 'totalFinancialImpact', label: 'Financial Impact', weight: 0.25 },
    { key: 'averageRecoveryDays', label: 'Recovery Days', weight: 0.15 },
    { key: 'resilienceScore', label: 'Resilience Score', weight: 0.15 },
  ];

  const breakdown = metrics.map(m => {
    const pVal = predicted[m.key];
    const aVal = actual[m.key];
    const mape = computeMape(pVal, aVal);
    const accuracy = accuracyFromMape(mape);
    return { metric: m.label, key: m.key, predicted: pVal, actual: aVal, mape: +mape.toFixed(3), accuracy, weight: m.weight };
  });

  const aggregateScore = Math.round(breakdown.reduce((s, m) => s + m.accuracy * m.weight, 0));
  return { breakdown, aggregateScore };
}

function runBacktest(eventId) {
  const events = dataStore.getStore().historicalDisruptions || [];
  const event = events.find(e => e.id === eventId);
  if (!event) return { error: `Historical disruption '${eventId}' not found` };

  const livePrediction = replayEvent(event);
  const accuracy = computeAccuracyMetrics(event);

  return {
    eventId: event.id,
    title: event.title,
    predictedImpact: event.predictedImpact,
    actualImpact: event.actualImpact,
    liveSimulationResult: {
      affectedNodes: livePrediction.affectedNodes,
      criticalCount: livePrediction.criticalCount,
      totalFinancialImpact: livePrediction.totalFinancialImpact,
      averageRecoveryDays: livePrediction.averageRecoveryDays,
      resilienceScore: livePrediction.resilienceScore,
    },
    accuracy,
  };
}

function runAllBacktests() {
  const events = dataStore.getStore().historicalDisruptions || [];
  return events.map(e => runBacktest(e.id));
}

function getHistoricalAccuracySummary() {
  const events = dataStore.getStore().historicalDisruptions || [];
  if (events.length === 0) return { totalEvents: 0, averageAccuracy: 0, byNodeType: {} };

  const results = events.map(e => computeAccuracyMetrics(e));
  const avgAccuracy = Math.round(results.reduce((s, r) => s + r.aggregateScore, 0) / events.length);

  const byNodeType = {};
  events.forEach((e, i) => {
    const node = dataStore.getNode(e.triggerNodeId);
    const type = node?.type || 'unknown';
    if (!byNodeType[type]) byNodeType[type] = { count: 0, totalAccuracy: 0 };
    byNodeType[type].count++;
    byNodeType[type].totalAccuracy += results[i].aggregateScore;
  });
  Object.keys(byNodeType).forEach(t => {
    byNodeType[t].averageAccuracy = Math.round(byNodeType[t].totalAccuracy / byNodeType[t].count);
    delete byNodeType[t].totalAccuracy;
  });

  return { totalEvents: events.length, averageAccuracy: avgAccuracy, byNodeType };
}

function calibrate(scenario) {
  const { triggerNodeId, severity = 0.8, duration = 30 } = scenario;
  const events = dataStore.getStore().historicalDisruptions || [];
  if (events.length === 0) return { confidenceScore: 85, similarEvents: [], rationale: 'No historical data — using default confidence' };

  const triggerNode = dataStore.getNode(triggerNodeId);
  const triggerType = triggerNode?.type || 'unknown';

  const scored = events.map(e => {
    const eNode = dataStore.getNode(e.triggerNodeId);
    const eType = eNode?.type || 'unknown';

    let nodeSimilarity = 0;
    if (e.triggerNodeId === triggerNodeId) nodeSimilarity = 1.0;
    else if (eType === triggerType) nodeSimilarity = 0.6;
    else nodeSimilarity = 0.2;

    const severitySim = Math.max(0, 1 - Math.abs(e.severity - severity));
    const durationSim = Math.max(0, 1 - Math.abs(e.duration - duration) / Math.max(1, duration));

    const totalSim = nodeSimilarity * 0.5 + severitySim * 0.3 + durationSim * 0.2;
    const accMetrics = computeAccuracyMetrics(e);

    return { eventId: e.id, title: e.title, similarity: +totalSim.toFixed(3), accuracy: accMetrics.aggregateScore, breakdown: accMetrics.breakdown };
  });

  const topK = scored.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  const totalWeight = topK.reduce((s, e) => s + Math.max(0, e.similarity), 0) || 1;

  let weightedScore = 0;
  topK.forEach(e => weightedScore += e.accuracy * Math.max(0, e.similarity) / totalWeight);
  weightedScore = Math.round(weightedScore);

  return {
    confidenceScore: weightedScore,
    similarEvents: topK,
    rationale: topK.length > 0
      ? `Based on ${topK.length} similar historical disruption${topK.length > 1 ? 's' : ''} (top match: ${topK[0].title} at ${Math.round(topK[0].similarity * 100)}% similarity). Model accuracy on comparable events: ${weightedScore}%.`
      : 'No comparable historical disruptions found.',
  };
}

module.exports = { runBacktest, runAllBacktests, getHistoricalAccuracySummary, calibrate, computeAccuracyMetrics, replayEvent };
