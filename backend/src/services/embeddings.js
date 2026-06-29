const config = require('../utils/config');
const logger = require('../utils/logger');

const PY_BASE = `http://${config.simulation.host}:${config.simulation.port}`;

function httpPost(path, body, timeout = 15000) {
  return new Promise((resolve) => {
    const http = require('http');
    const data = JSON.stringify(body);
    const r = http.request({
      hostname: config.simulation.host, port: config.simulation.port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout,
    }, resp => { let b = ''; resp.on('data', c => b += c); resp.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } }); });
    r.on('error', () => resolve(null));
    r.write(data);
    r.end();
  });
}

async function generateEmbedding(text) {
  const result = await httpPost('/embeddings/search', { query: text, k: 1 }, 10000);
  if (result && result.results) return result;
  return null;
}

async function searchSimilar(query, k = 10) {
  const result = await httpPost('/embeddings/search', { query, k }, 15000);
  if (result && result.results) return result.results;
  return [];
}

async function ingestTexts(documents) {
  const result = await httpPost('/embeddings/ingest', { documents }, 30000);
  return result && result.status === 'ok';
}

async function ragQuery(query, k = 8) {
  const result = await httpPost('/rag/query', { query, k }, 30000);
  if (result && result.answer) return result;
  return null;
}

module.exports = { generateEmbedding, searchSimilar, ingestTexts, ragQuery };