const { query } = require('../db');
const dataStore = require('../../data-store');

async function findAll() {
  try { const r = await query('SELECT * FROM nodes ORDER BY type, name'); return r.rows; }
  catch { return dataStore.getStore().graph.nodes; }
}

async function findById(id) {
  try { const r = await query('SELECT * FROM nodes WHERE id = $1', [id]); return r.rows[0] || null; }
  catch { return dataStore.getNode(id) || null; }
}

async function update(id, attrs) {
  try {
    await query('UPDATE nodes SET attributes = attributes || $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(attrs), id]);
    return true;
  } catch {
    dataStore.updateNode(id, attrs);
    return true;
  }
}

async function searchByEmbedding(embedding, limit = 10) {
  try {
    const r = await query(
      'SELECT id, name, type, attributes, 1 - (embedding <=> $1::vector) AS similarity FROM nodes WHERE embedding IS NOT NULL ORDER BY embedding <=> $1::vector LIMIT $2',
      [JSON.stringify(embedding), limit]
    );
    return r.rows;
  } catch { return []; }
}

async function searchByKeyword(terms) {
  const store = dataStore.getStore();
  return store.graph.nodes.filter(n => {
    const text = `${n.id} ${JSON.stringify(n.attributes || {})}`.toLowerCase();
    return terms.some(t => text.includes(t));
  }).slice(0, 10).map(n => ({ id: n.id, name: n.id.replace(/_t$/, ''), type: n.type || 'tier', attributes: n, similarity: 0.5 }));
}

module.exports = { findAll, findById, update, searchByEmbedding, searchByKeyword };
