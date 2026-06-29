// =============================================================================
// Database Connection Pool — PostgreSQL + pgvector (optional)
// Graceful fallback to JSON file store if pg package unavailable.
// =============================================================================

let pg;
try { pg = require('pg'); } catch { pg = null; }

const info = (...args) => console.log(...args);
const warn = (...args) => console.warn(...args);
const err = (...args) => console.error(...args);

let pool = null;
let ready = false;

function getPool() {
  if (pool) return pool;
  if (!pg) return null;
  try {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://morningstar:morningstar@localhost:5432/morningstar',
      max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on('error', e => warn('Database pool error:', e.message));
    return pool;
  } catch (e) {
    warn('Could not create database pool:', e.message);
    return null;
  }
}

async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('PostgreSQL not available (install pg package)');
  return p.query(text, params);
}

async function ensureSchema() {
  const fs = require('fs');
  const path = require('path');
  const p = getPool();
  if (!p) { info('PostgreSQL not available — skipping schema creation'); ready = false; return; }
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await p.query(schema);
    info('  ✓ PostgreSQL schema ensured');
    ready = true;
  } catch (e) {
    warn('  ⚠ Schema migration failed:', e.message);
    ready = false;
  }
}

function isReady() { return ready; }

module.exports = { query, ensureSchema, isReady, getPool: getPool || (() => null) };
