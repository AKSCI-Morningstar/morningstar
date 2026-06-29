const { Pool } = require('pg');
const config = require('../utils/config');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

let pool = null;
let ready = false;

function getPool() {
  if (pool) return pool;
  try {
    pool = new Pool({
      connectionString: config.database.url,
      max: config.database.poolSize,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on('error', err => logger.error({ err }, 'Database pool error'));
    return pool;
  } catch (err) {
    logger.warn({ err }, 'Could not create database pool');
    return null;
  }
}

async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('Database not available');
  return p.query(text, params);
}

async function ensureSchema() {
  const p = getPool();
  if (!p) { ready = false; return; }
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await p.query(sql);
    }
    ready = true;
    logger.info('All migrations applied');
  } catch (err) {
    ready = false;
    logger.warn({ err }, 'Migration failed');
  }
}

function isReady() { return ready; }

module.exports = { query, ensureSchema, isReady, getPool: () => getPool() || { query: async () => ({ rows: [] }) } };
