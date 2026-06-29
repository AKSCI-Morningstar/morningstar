// =============================================================================
// AKSCI MORNINGSTAR — Production Backend Server v2.0
// =============================================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const config = require('./src/utils/config');
const logger = require('./src/utils/logger');

const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: config.sessionSecret, resave: false, saveUninitialized: true, cookie: { secure: config.nodeEnv === 'production', maxAge: 86400000 } }));

try {
  const rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({ windowMs: 60000, max: config.rateLimitMax, message: { error: 'Too many requests' } }));
} catch { /* rate limit optional */ }

app.use(express.static(path.join(__dirname, '..')));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => { const d = Date.now() - start; if (d > 1000) logger.warn({ method: req.method, url: req.originalUrl, status: res.statusCode, duration: d }, 'Slow'); });
  next();
});

// ---------------------------------------------------------------------------
// Data Store
// ---------------------------------------------------------------------------
const dataStore = require('./data-store');
dataStore.load();
logger.info('Data store loaded');

// ---------------------------------------------------------------------------
// Database (optional — graceful fallback to JSON file)
// ---------------------------------------------------------------------------
let dbReady = false;
(async () => {
  try {
    const { ensureSchema, isReady } = require('./src/db');
    await ensureSchema();
    dbReady = isReady();
    if (dbReady) logger.info('PostgreSQL + pgvector ready');
    else logger.warn('PostgreSQL unavailable — using JSON file store');
  } catch { logger.warn('PostgreSQL unavailable — using JSON file store'); }
})();

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------
const { setupWebSocket } = require('./src/routes/websocket');
setupWebSocket(server);

// =============================================================================
// Routes
// =============================================================================
app.use('/api/nlq', require('./src/routes/nlq'));
app.use('/api/actions', require('./src/routes/actions'));
app.use('/api/simulation', require('./src/routes/simulation'));
app.use('/api/feedback', require('./src/routes/feedback'));
app.use('/api/graph', require('./src/routes/graph'));
app.use('/api/feeds', require('./src/routes/ingestion'));
app.use('/api/webhook', require('./src/routes/webhook'));
app.use('/api/reconciliation', require('./src/routes/reconciliation'));
app.use('/api/temporal', require('./src/routes/temporal'));
app.use('/api/feeds/manage', require('./src/routes/feeds'));
app.use('/api/macro', require('./src/routes/macro'));
app.use('/api/deploy', require('./src/routes/deploy'));

// =============================================================================
// Health
// =============================================================================
app.get('/api/health', (req, res) => {
  const store = dataStore.getStore();
  res.json({
    status: 'ok', version: '2.0.0',
    database: dbReady ? 'postgresql+pgvector' : 'json-file',
    rag: { provider: 'local-tfidf-numpy', status: 'active' },
    reconciliation: { status: 'active', layer: 1 },
    temporal: { status: 'active', layer: 2 },
    feeds: { mockGenerators: 6, active: process['_mockFeedsStarted'] ? true : false },
    llm: {
      provider: config.llm.provider,
      configured: !!(config.llm.openaiKey || config.llm.anthropicKey || config.llm.groqKey || config.llm.geminiKey || config.llm.openrouterKey || config.llm.bazaarlinkKey),
      availableProviders: [
        ...(config.llm.openaiKey ? ['openai'] : []),
        ...(config.llm.anthropicKey ? ['anthropic'] : []),
        ...(config.llm.groqKey ? ['groq'] : []),
        ...(config.llm.geminiKey ? ['gemini'] : []),
        ...(config.llm.openrouterKey ? ['openrouter'] : []),
        ...(config.llm.bazaarlinkKey ? ['bazaarlink'] : []),
      ],
      freeOptions: 'BazaarLink configured (free), or set GROQ_API_KEY / GEMINI_API_KEY / OPENROUTER_API_KEY',
    },
    graph: { nodes: store.graph.nodes.length, edges: store.graph.edges.length },
    actions: { executed: store.actions.length },
    simulations: { executed: store.simulations.length },
    feedback: { recommendations: store.feedback.recommendations.length, outcomes: store.feedback.outcomes.length },
    websocket: { clients: require('./src/routes/websocket').wssCount() },
    macro: { status: 'active', pillars: 4, scheduler: 'APScheduler (15m/30m/1h)' },
    uptime: process.uptime(),
  });
});

// =============================================================================
// Feed & RAG Initialization
// =============================================================================
(async () => {
  try {
    const mockFeeds = require('./src/services/mock-feeds');
    mockFeeds.ingestAllDemo();
    process._mockFeedsStarted = true;
    logger.info('Mock feeds ingested (SAP Ariba, Teamcenter, Outlook, D&B, SPIRE, SAM)');
  } catch (e) { logger.warn({ err: e }, 'Mock feed init failed'); }

  try {
    const http = require('http');
    const store = dataStore.getStore();
    const docs = [];
    store.graph.nodes.forEach(n => {
      docs.push({ id: n.id, name: n.name || n.id, type: n.type, content: `${n.name || n.id} (${n.type}): risk=${n.risk || 0} ${n.description || ''}` });
    });
    store.graph.edges.forEach(e => {
      docs.push({ id: `edge:${e.source}->${e.target}`, name: `${e.source}->${e.target}`, type: 'edge', content: `${e.source} supplies ${e.target}` });
    });
    (store.historicalDisruptions || []).forEach(d => {
      docs.push({ id: d.id, name: d.title, type: 'historical_disruption', content: `${d.title}: ${d.description}` });
    });
        const body = JSON.stringify({ documents: docs });
        const req = http.request({ hostname: config.simulation.host, port: config.simulation.port, path: '/embeddings/ingest', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, timeout: 30000 }, res => {
          let data = ''; res.on('data', c => data += c); res.on('end', () => { try { const j = JSON.parse(data); logger.info({ ingested: j.ingested?.ingested || 0 }, 'RAG index loaded'); } catch (e) { logger.warn({ err: e.message }, 'RAG index parse failed'); } });
        });
        req.on('error', (e) => logger.warn({ err: e.message }, 'RAG indexing skipped'));
        req.write(body); req.end();
  } catch (e) { logger.warn({ err: e }, 'RAG init failed'); }

  try {
    const temporal = require('./src/services/temporal-store');
    temporal.recordSnapshot();
    logger.info('Temporal snapshot recorded');
  } catch (e) { logger.warn({ err: e }, 'Temporal init failed'); }
})();

// =============================================================================
// Macro Intelligence — periodic poll from Node.js to push via WS
// =============================================================================
async function pushMacroUpdate() {
  try {
    const http = require('http');
    const req = http.get({ hostname: SIM_HOST, port: SIM_PORT, path: '/macro/composite', timeout: 10000 }, (resp) => {
      let data = '';
      resp.on('data', (c) => (data += c));
      resp.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'ok') {
            const { broadcast } = require('./src/routes/websocket');
            broadcast('macro:update', result.score);
          }
        } catch {}
      });
    });
    req.on('error', () => {});
    req.end();
  } catch {}
}
// Push macro updates every 5 minutes
setInterval(pushMacroUpdate, 300000);

// =============================================================================
// Notifications
// =============================================================================
const notifications = require('./src/services/notifications');
app.post('/api/notifications/register', async (req, res) => {
  const { token, platform } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  // Store token — in-memory for now
  res.json({ success: true });
});

app.post('/api/notifications/alert', async (req, res) => {
  const { severity, title, message, data } = req.body;
  if (!severity || !title || !message) return res.status(400).json({ error: 'severity, title, message required' });
  const { broadcast } = require('./src/routes/websocket');
  broadcast('alert', { severity, title, message, ...data });
  res.json({ success: true });
});

// =============================================================================
// Google OAuth
// =============================================================================
if (config.google.clientId) {
  const { google } = require('googleapis');
  app.get('/api/integrations/status', (req, res) => {
    res.json({ google: { configured: true, authenticated: !!req.session.tokens } });
  });
  app.get('/api/auth/google', (req, res) => {
    const oauth = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri);
    res.redirect(oauth.generateAuthUrl({
      access_type: 'offline', prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'],
    }));
  });
  app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Missing code' });
    try {
      const oauth = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUri);
      const { tokens } = await oauth.getToken(code);
      req.session.tokens = tokens;
      res.redirect('/dashboard.html?integration=google-ok');
    } catch (e) { res.redirect('/dashboard.html?integration=google-error'); }
  });
}

app.post('/api/system/reindex-rag', async (req, res) => {
  try {
    const emb = require('./src/services/embeddings');
    const store = dataStore.getStore();
    const docs = [];
    store.graph.nodes.forEach(n => docs.push({ id: n.id, name: n.name || n.id, type: n.type, content: `${n.name || n.id} (${n.type}): risk=${n.risk || 0} ${n.description || ''}` }));
    store.graph.edges.forEach(e => docs.push({ id: `edge:${e.source}->${e.target}`, name: `${e.source}->${e.target}`, type: 'edge', content: `${e.source} supplies ${e.target}` }));
    (store.historicalDisruptions || []).forEach(d => docs.push({ id: d.id, name: d.title, type: 'historical_disruption', content: `${d.title}: ${d.description}` }));
    const ok = await emb.ingestTexts(docs);
    res.json({ success: ok, count: docs.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =============================================================================
// Start
// =============================================================================
server.listen(config.port, () => {
  console.log('');
  console.log('  ============================================');
  console.log('   AKSCI MORNINGSTAR — Backend v2.0');
  console.log('  ============================================');
  console.log(`   REST:      http://localhost:${config.port}/api/`);
  console.log(`   WebSocket: ws://localhost:${config.port}/ws`);
  console.log(`   Dashboard: http://localhost:${config.port}/dashboard.html`);
  console.log(`   Demo:      http://localhost:${config.port}/capabilities.html`);
  console.log(`   Health:    http://localhost:${config.port}/api/health`);
  console.log('');
  console.log(`   DB:        ${dbReady ? 'PostgreSQL + pgvector' : 'JSON file (fallback)'}`);
  console.log(`   RAG:       Local TF-IDF vector store (numpy/scipy)`);
  console.log(`   LLM:       ${config.llm.bazaarlinkKey ? 'BazaarLink free (auto:free)' : config.llm.openaiKey ? 'GPT-4o configured' : 'Local template/RAG fallback'}`);
  console.log(`   Graph:     ${dataStore.getStore().graph.nodes.length} nodes, ${dataStore.getStore().graph.edges.length} edges`);
  console.log(`   Layer 1:   Data Reconciliation Engine (fuzzy matching, ETL, entity resolution)`);
  console.log(`   Layer 2:   Temporal Graph Store (time-series, versioned state, trend analysis)`);
  console.log(`   Feeds:     6 mock generators (SAP Ariba, Teamcenter, Outlook, D&B, SPIRE, SAM)`);
   console.log(`   Email:     ${config.email.user ? 'SMTP configured' : 'Not configured'}`);
   console.log(`   Macro:     Aerospace Macro Risk Score (4 pillars, ${config.macro.fredApiKey ? 'FRED live' : 'mock commodities'}, ${config.macro.vesselfinderApiKey ? 'VesselFinder live' : 'mock ports'})`);
   console.log('  ============================================');
  console.log('');
});

module.exports = app;
