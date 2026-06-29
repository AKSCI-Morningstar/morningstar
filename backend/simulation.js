// =============================================================================
// Simulation Engine — Multi-Echelon Supply Chain Stress Test
// JS-native implementation (Python OR-Tools stub included for production)
// =============================================================================

const { getStore, getNode, getEdgesForNode, getDownstream, logSimulation } = require('./data-store');

// Risk propagation model: given a disrupted node, compute cascading impact
function simulateCascadingFailure({ triggerNodeId, severity, duration }) {
  const store = getStore();
  const triggerNode = store.graph.nodes.find(n => n.id === triggerNodeId);
  if (!triggerNode) return { error: 'Node not found: ' + triggerNodeId };

  severity = severity || 1.0; // 0-1 scale
  duration = duration || 30; // days

  // Walk downstream to find all affected nodes
  const affected = getDownstream(triggerNodeId);
  const affectedNodes = affected.map(id => store.graph.nodes.find(n => n.id === id)).filter(Boolean);

  // Compute impact scores
  const results = affectedNodes.map(node => {
    let impact = 0;
    const edges = getEdgesForNode(node.id);

    // Closer to trigger = higher impact
    const depth = getPropagationDepth(triggerNodeId, node.id);
    const dampening = Math.max(0.05, 1 - (depth * 0.15));
    const nodeImpact = severity * dampening;

    // Financial impact estimate
    let financialImpact = 0;
    if (node.revenue) financialImpact = node.revenue * nodeImpact * (duration / 365);
    if (node.type === 'component' && node.qty !== undefined) {
      const reorderCost = (node.reorder || 100) * 4200;
      financialImpact += reorderCost * nodeImpact * (duration / 30);
    }

    // Recovery time based on depth and severity
    const recoveryDays = Math.round(duration * dampening + edges.length * 2);

    // Risk contribution
    const riskDelta = Math.round(nodeImpact * 100);
    const newRisk = Math.min(100, (node.risk || 0) + riskDelta);

    return {
      nodeId: node.id,
      nodeName: node.id.replace(/_t$/, ''),
      type: node.type,
      depth,
      impactScore: Math.round(nodeImpact * 100),
      riskBefore: node.risk || 0,
      riskAfter: newRisk,
      recoveryDays,
      financialImpact: Math.round(financialImpact),
      status: nodeImpact > 0.5 ? 'critical' : nodeImpact > 0.25 ? 'warning' : 'monitor'
    };
  }).sort((a, b) => b.impactScore - a.impactScore);

  // Aggregate metrics
  const totalFinancialImpact = results.reduce((s, r) => s + r.financialImpact, 0);
  const criticalCount = results.filter(r => r.status === 'critical').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const avgRecovery = Math.round(results.reduce((s, r) => s + r.recoveryDays, 0) / Math.max(1, results.length));

  // Resilience score: 100 - (average impact * 0.7 + critical ratio * 30)
  const avgImpact = results.reduce((s, r) => s + r.impactScore, 0) / Math.max(1, results.length);
  const criticalRatio = criticalCount / Math.max(1, results.length);
  const resilienceScore = Math.max(0, Math.round(100 - (avgImpact * 0.7 + criticalRatio * 30)));

  return {
    triggerNode: triggerNodeId,
    severity,
    duration,
    totalAffectedNodes: results.length,
    criticalCount,
    warningCount,
    totalFinancialImpact,
    averageRecoveryDays: avgRecovery,
    resilienceScore,
    affectedNodes: results.slice(0, 20),
    timestamp: Date.now()
  };
}

// Multi-scenario stress test
function simulateStressTest(scenarios) {
  const results = scenarios.map(s => simulateCascadingFailure(s));
  const avgResilience = Math.round(results.reduce((s, r) => s + (r.resilienceScore || 0), 0) / Math.max(1, results.length));
  const totalFinancialExposure = results.reduce((s, r) => s + (r.totalFinancialImpact || 0), 0);

  return {
    scenarios: results,
    aggregateResilience: avgResilience,
    totalFinancialExposure,
    worstCase: results.sort((a, b) => (b.totalFinancialImpact || 0) - (a.totalFinancialImpact || 0))[0] || null,
    timestamp: Date.now()
  };
}

// Propagation depth using BFS
function getPropagationDepth(fromId, toId) {
  const store = getStore();
  const visited = new Set();
  const queue = [{ id: fromId, depth: 0 }];
  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (id === toId) return depth;
    if (visited.has(id)) continue;
    visited.add(id);
    store.graph.edges.filter(e => e.source === id).forEach(e => {
      if (!visited.has(e.target)) queue.push({ id: e.target, depth: depth + 1 });
    });
  }
  return 999;
}

// Sourcing optimization: given a set of demands and suppliers, suggest optimal allocation
function optimizeSourcing(demands, suppliers) {
  // Simplified linear optimization (replace with OR-Tools for production)
  const results = demands.map(demand => {
    const available = suppliers.filter(s => {
      const node = getNode(s);
      return node && node.type === 'supplier' && node.risk < 50;
    });

    const allocation = {};
    let remaining = demand.quantity || 100;
    available.forEach(s => {
      const node = getNode(s);
      if (!node) return;
      const share = Math.min(remaining, Math.round((demand.quantity || 100) * (1 - (node.risk || 0) / 100) / available.length));
      if (share > 0) {
        allocation[s] = { quantity: share, cost: share * 4200, risk: node.risk || 0, leadTime: 14 };
        remaining -= share;
      }
    });

    return {
      partId: demand.partId,
      totalQuantity: demand.quantity,
      allocated: allocation,
      unallocated: remaining,
      totalCost: Object.values(allocation).reduce((s, a) => s + a.cost, 0),
      averageRisk: Object.values(allocation).length > 0
        ? Math.round(Object.values(allocation).reduce((s, a) => s + a.risk, 0) / Object.values(allocation).length)
        : 100
    };
  });

  return results;
}

module.exports = { simulateCascadingFailure, simulateStressTest, optimizeSourcing };
