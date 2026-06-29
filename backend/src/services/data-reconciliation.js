const dataStore = require('../../data-store');
const logger = require('../utils/logger');

function fuzzyMatch(a, b) {
  a = (a || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  b = (b || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (longer.length === 0) return 0;
  const edits = levenshtein(longer, shorter);
  return 1 - edits / longer.length;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function reconcileSource(source, records, fieldMap) {
  const store = dataStore.getStore();
  const results = { ingested: 0, matched: 0, created: 0, errors: [] };

  for (const record of records) {
    try {
      const mapped = {};
      for (const [to, from] of Object.entries(fieldMap)) {
        mapped[to] = typeof from === 'function' ? from(record) : record[from];
      }

      let best = { node: null, score: 0 };
      for (const node of store.graph.nodes) {
        const nameSim = fuzzyMatch(mapped.name, node.name || node.id);
        const idSim = mapped.id && node.id ? fuzzyMatch(mapped.id, node.id) : 0;
        const score = Math.max(nameSim, idSim);
        if (score > best.score) best = { node, score };
      }

      if (best.score >= 0.8) {
        dataStore.updateNode(best.node.id, { ...mapped, lastReconciled: new Date().toISOString(), source });
        results.matched++;
      } else if (best.score >= 0.5) {
        dataStore.logReconciliation({ source, record: mapped, matchedTo: best.node?.id, confidence: Math.round(best.score * 100), action: 'pending_review' });
        results.errors.push(`Ambiguous match: "${mapped.name}" vs "${best.node?.name}" (${Math.round(best.score * 100)}%)`);
      } else {
        const newId = mapped.id || mapped.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
        const node = { id: newId, name: mapped.name, type: mapped.type || 'supplier', attributes: { ...mapped, source }, risk: 30 };
        dataStore.addNode(node);
        results.created++;
      }
      results.ingested++;
    } catch (e) {
      results.errors.push(e.message);
    }
  }

  return results;
}

function resolveEntities(threshold = 0.85) {
  const store = dataStore.getStore();
  const resolved = [];
  const seen = new Set();

  for (let i = 0; i < store.graph.nodes.length; i++) {
    if (seen.has(i)) continue;
    const cluster = [i];
    for (let j = i + 1; j < store.graph.nodes.length; j++) {
      if (seen.has(j)) continue;
      const score = fuzzyMatch(store.graph.nodes[i].name || '', store.graph.nodes[j].name || '');
      if (score >= threshold) { cluster.push(j); seen.add(j); }
    }
    if (cluster.length > 1) {
      const source = store.graph.nodes[cluster[0]];
      const merged = { ...source };
      for (let k = 1; k < cluster.length; k++) {
        Object.assign(merged.attributes || {}, store.graph.nodes[cluster[k]].attributes || {});
      }
      resolved.push({ kept: source.id, merged: cluster.slice(1).map(i => store.graph.nodes[i].id), entities: cluster.map(i => store.graph.nodes[i].name) });
    }
  }
  return resolved;
}

function etlPipeline(source, rawData, transformFn) {
  const transformed = (transformFn || (x => x))(rawData);
  const reconciled = reconcileSource(source, Array.isArray(transformed) ? transformed : [transformed], {});
  return reconciled;
}

module.exports = { reconcileSource, resolveEntities, etlPipeline, fuzzyMatch };