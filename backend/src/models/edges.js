const { query } = require('../db');
const dataStore = require('../../data-store');

async function findAll() {
  try { const r = await query('SELECT * FROM edges ORDER BY source_id, target_id'); return r.rows; }
  catch { return dataStore.getStore().graph.edges; }
}

async function findBySource(sourceId) {
  try { const r = await query('SELECT * FROM edges WHERE source_id = $1', [sourceId]); return r.rows; }
  catch { return dataStore.getStore().graph.edges.filter(e => e.source === sourceId); }
}

async function findByTarget(targetId) {
  try { const r = await query('SELECT * FROM edges WHERE target_id = $1', [targetId]); return r.rows; }
  catch { return dataStore.getStore().graph.edges.filter(e => e.target === targetId); }
}

async function getGraph() {
  const store = dataStore.getStore();
  try {
    const nodes = await query('SELECT * FROM nodes ORDER BY type, name');
    const edges = await query('SELECT * FROM edges ORDER BY source_id, target_id');
    return { nodes: nodes.rows, edges: edges.rows };
  } catch {
    return store.graph;
  }
}

module.exports = { findAll, findBySource, findByTarget, getGraph };
