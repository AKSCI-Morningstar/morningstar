// =============================================================================
// Persistent Data Store — JSON file-backed, SQL-ready for PostgreSQL/Neo4j migration
// =============================================================================
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data-store.json');

// Default store with initial graph data
const DEFAULT_STORE = {
  graph: {
    nodes: [
      { id: 'Artemis Program_t', type: 'program', revenue: 500000, risk: 0 },
      { id: 'Orion Capsule_t', type: 'program', revenue: 320000, risk: 0 },
      { id: 'Engine Subsystem_t', type: 'assembly', risk: 0 },
      { id: 'Fuel Tank_t', type: 'assembly', risk: 0 },
      { id: 'Heat Shield_t', type: 'assembly', risk: 0 },
      { id: 'Avionics Bay_t', type: 'assembly', risk: 0 },
      { id: 'Titanium Casting_t', type: 'component', qty: 120, reorder: 200, requiredCertifications: ['as9100', 'itar', 'dfars'], risk: 0 },
      { id: 'Valve Group_t', type: 'component', qty: 450, reorder: 100, risk: 0 },
      { id: 'Ceramic Tiles_t', type: 'component', qty: 80, reorder: 150, risk: 0 },
      { id: 'Wiring Harness_t', type: 'component', qty: 600, reorder: 200, risk: 0 },
      { id: 'Carbon Fiber Panel_t', type: 'component', qty: 30, reorder: 100, risk: 0 },
      { id: 'Sensor Array_t', type: 'component', qty: 200, reorder: 150, risk: 0 },
      { id: 'Aerocast Inc_t', type: 'supplier', risk: 85, email: 'procurement@aerocast.com', creditScore: 62, preVetted: false, riskFlags: ['No alternate source', 'Single-point failure', 'Geopolitical exposure: Asia-Pacific'] },
      { id: 'FluidLogic_t', type: 'supplier', risk: 15, email: 'orders@fluidlogic.com', creditScore: 91, preVetted: true, riskFlags: [] },
      { id: 'CeramicTech_t', type: 'supplier', risk: 50, email: 'info@ceramictech.com', creditScore: 74, preVetted: false, riskFlags: ['Raw material shortage risk'] },
      { id: 'WiredIn Solutions_t', type: 'supplier', risk: 25, email: 'supply@wiredin.com', creditScore: 88, preVetted: true, riskFlags: [] },
      { id: 'NanoSense Inc_t', type: 'supplier', risk: 40, email: 'contact@nanosense.com', creditScore: 55, preVetted: false, riskFlags: ['Single-point failure', 'Geopolitical exposure: Asia-Pacific'] },
      { id: 'StellarMet_t', type: 'supplier', risk: 68, email: 'qa@stellarmet.com', creditScore: 45, preVetted: false, riskFlags: ['Baoji smelter output -23%', 'Ti-6Al-4V sole source', 'Qual window closing 12d'] },
      { id: 'AMETEK Specialty_t', type: 'supplier', risk: 12, email: 'supply@ametek.com', creditScore: 94, preVetted: true, riskFlags: [] },
      { id: 'QualiMet_t', type: 'supplier', risk: 72, email: 'qa@qualimet.com', creditScore: 38, preVetted: false, riskFlags: ['FAA PMA overdue 11d', 'Single-point failure'] },
      { id: 'NanoAlloy_t', type: 'supplier', risk: 28, email: 'ops@nanoalloy.com', creditScore: 81, preVetted: true, riskFlags: ['Cure profile change +3d'] },
      { id: 'F-35 Program_t', type: 'program', revenue: 12000000, risk: 74 },
      { id: 'Port of Long Beach_t', type: 'port', risk: 10 },
      { id: 'Port of Rotterdam_t', type: 'port', risk: 8 },
      { id: 'Dayton Facility_t', type: 'facility', risk: 0 },
      { id: 'Houston Assembly Plant_t', type: 'facility', risk: 0 },
      { id: 'Singapore Buffer Stock_t', type: 'warehouse', qty: 500, reorder: 200, weeklyDemand: 80, risk: 0 },
      { id: 'Asia-Pacific_t', type: 'region', risk: 20 },
    ],
    edges: [
      { source: 'Aerocast Inc_t', target: 'Titanium Casting_t', type: 'manufactures', leadTime: 7 },
      { source: 'FluidLogic_t', target: 'Valve Group_t', type: 'manufactures', leadTime: 3 },
      { source: 'CeramicTech_t', target: 'Ceramic Tiles_t', type: 'manufactures', leadTime: 5 },
      { source: 'WiredIn Solutions_t', target: 'Wiring Harness_t', type: 'manufactures', leadTime: 2 },
      { source: 'NanoSense Inc_t', target: 'Sensor Array_t', type: 'manufactures', leadTime: 4 },
      { source: 'Titanium Casting_t', target: 'Engine Subsystem_t', type: 'supplies', leadTime: 2 },
      { source: 'Valve Group_t', target: 'Engine Subsystem_t', type: 'supplies', leadTime: 1 },
      { source: 'Ceramic Tiles_t', target: 'Heat Shield_t', type: 'supplies', leadTime: 3 },
      { source: 'Wiring Harness_t', target: 'Avionics Bay_t', type: 'supplies', leadTime: 1 },
      { source: 'Carbon Fiber Panel_t', target: 'Heat Shield_t', type: 'supplies', leadTime: 2 },
      { source: 'Sensor Array_t', target: 'Avionics Bay_t', type: 'supplies', leadTime: 2 },
      { source: 'Engine Subsystem_t', target: 'Artemis Program_t', type: 'depends_on', leadTime: 1 },
      { source: 'Fuel Tank_t', target: 'Orion Capsule_t', type: 'depends_on', leadTime: 1 },
      { source: 'Heat Shield_t', target: 'Orion Capsule_t', type: 'depends_on', leadTime: 1 },
      { source: 'Avionics Bay_t', target: 'Orion Capsule_t', type: 'depends_on', leadTime: 1 },
      { source: 'Engine Subsystem_t', target: 'Orion Capsule_t', type: 'depends_on', leadTime: 1 },
      { source: 'Port of Long Beach_t', target: 'Aerocast Inc_t', type: 'ships_to', leadTime: 10 },
      { source: 'Port of Rotterdam_t', target: 'FluidLogic_t', type: 'ships_to', leadTime: 14 },
      { source: 'Singapore Buffer Stock_t', target: 'Engine Subsystem_t', type: 'ships_to', leadTime: 5 },
      { source: 'StellarMet_t', target: 'Aerocast Inc_t', type: 'supplies', leadTime: 14 },
      { source: 'AMETEK Specialty_t', target: 'Titanium Casting_t', type: 'manufactures', leadTime: 6 },
      { source: 'QualiMet_t', target: 'Sensor Array_t', type: 'manufactures', leadTime: 8 },
      { source: 'NanoAlloy_t', target: 'Ceramic Tiles_t', type: 'manufactures', leadTime: 4 },
      { source: 'StellarMet_t', target: 'F-35 Program_t', type: 'supplies', leadTime: 21 },
    ]
  },
  actions: [],
  feedback: {
    recommendations: [],
    outcomes: [],
    userActions: []
  },
  simulations: [],
  feeds: {},
  temporal: [],
  reconciliationLog: [],
  historicalDisruptions: [
    {
      id: 'disruption-titanium-2026',
      title: 'Ti-6Al-4V Shortage — Baoji Smelter Shutdown',
      description: 'Regulatory energy directive in Shaanxi province forced 23% output reduction at Baoji titanium smelter. StellarMet sole-source Ti-6Al-4V supply disrupted, cascading to Aerocast Inc castings, Engine Subsystem assembly, and F-35/Artemis programs.',
      triggerNodeId: 'StellarMet_t',
      severity: 0.82,
      duration: 45,
      leadDaysBeforeDetection: 83,
      predictedAt: '2025-12-15T00:00:00.000Z',
      occurredAt: '2026-03-10T00:00:00.000Z',
      predictedImpact: { affectedNodes: 9, criticalCount: 3, warningCount: 3, totalFinancialImpact: 47000000, averageRecoveryDays: 35, resilienceScore: 45 },
      actualImpact: { affectedNodes: 10, criticalCount: 4, warningCount: 3, totalFinancialImpact: 42300000, averageRecoveryDays: 38, resilienceScore: 42 }
    },
    {
      id: 'disruption-ceramictech-2026',
      title: 'CeramicTech Nadcap NDT Recertification Gap',
      description: 'CeramicTech Nadcap NDT certification expired during audit scheduling delay, halting Ceramic Tiles production for 18 days. Heat Shield assembly for Orion Capsule impacted.',
      triggerNodeId: 'CeramicTech_t',
      severity: 0.65,
      duration: 18,
      leadDaysBeforeDetection: 42,
      predictedAt: '2026-02-10T00:00:00.000Z',
      occurredAt: '2026-03-25T00:00:00.000Z',
      predictedImpact: { affectedNodes: 6, criticalCount: 2, warningCount: 2, totalFinancialImpact: 8500000, averageRecoveryDays: 14, resilienceScore: 62 },
      actualImpact: { affectedNodes: 7, criticalCount: 2, warningCount: 2, totalFinancialImpact: 7800000, averageRecoveryDays: 16, resilienceScore: 58 }
    },
    {
      id: 'disruption-longbeach-2026',
      title: 'Port of Long Beach Congestion Event',
      description: 'ILWU labor slowdown at Port of Long Beach caused 10-day container backlog. Aerocast Inc raw material intake delayed, cascading to Titanium Casting and Engine Subsystem.',
      triggerNodeId: 'Port of Long Beach_t',
      severity: 0.45,
      duration: 14,
      leadDaysBeforeDetection: 21,
      predictedAt: '2026-04-01T00:00:00.000Z',
      occurredAt: '2026-04-22T00:00:00.000Z',
      predictedImpact: { affectedNodes: 8, criticalCount: 1, warningCount: 3, totalFinancialImpact: 3200000, averageRecoveryDays: 10, resilienceScore: 71 },
      actualImpact: { affectedNodes: 9, criticalCount: 1, warningCount: 3, totalFinancialImpact: 2900000, averageRecoveryDays: 11, resilienceScore: 68 }
    },
    {
      id: 'disruption-nanosense-2025',
      title: 'NanoSense Sensor Array Quality Failure',
      description: 'Batch contamination at NanoSense Inc facility caused 40% failure rate in Sensor Array production. Avionics Bay assembly delayed for Orion Capsule.',
      triggerNodeId: 'NanoSense Inc_t',
      severity: 0.55,
      duration: 22,
      leadDaysBeforeDetection: 35,
      predictedAt: '2025-10-15T00:00:00.000Z',
      occurredAt: '2025-11-20T00:00:00.000Z',
      predictedImpact: { affectedNodes: 5, criticalCount: 1, warningCount: 2, totalFinancialImpact: 5600000, averageRecoveryDays: 18, resilienceScore: 66 },
      actualImpact: { affectedNodes: 5, criticalCount: 1, warningCount: 2, totalFinancialImpact: 5100000, averageRecoveryDays: 20, resilienceScore: 63 }
    },
    {
      id: 'disruption-qualimet-2025',
      title: 'QualiMet FAA PMA Lapse',
      description: 'QualiMet FAA PMA certification lapsed due to incomplete documentation renewal. Sensor Array deliveries halted for 12 days across F-35 and Artemis supply lines.',
      triggerNodeId: 'QualiMet_t',
      severity: 0.60,
      duration: 12,
      leadDaysBeforeDetection: 28,
      predictedAt: '2025-08-01T00:00:00.000Z',
      occurredAt: '2025-08-29T00:00:00.000Z',
      predictedImpact: { affectedNodes: 4, criticalCount: 1, warningCount: 2, totalFinancialImpact: 4100000, averageRecoveryDays: 10, resilienceScore: 70 },
      actualImpact: { affectedNodes: 5, criticalCount: 1, warningCount: 2, totalFinancialImpact: 3800000, averageRecoveryDays: 12, resilienceScore: 67 }
    }
  ]
};

// Load or initialize store
let store = null;

function load() {
  if (store) return store;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      store = JSON.parse(raw);
      // Migrate: ensure all keys exist
      Object.keys(DEFAULT_STORE).forEach(k => { if (!store[k]) store[k] = JSON.parse(JSON.stringify(DEFAULT_STORE[k])); });
      DEFAULT_STORE.graph.nodes.forEach(dn => { if (!store.graph.nodes.find(n => n.id === dn.id)) store.graph.nodes.push(dn); });
      console.log('  ✓ Data store loaded (' + store.graph.nodes.length + ' nodes, ' + store.graph.edges.length + ' edges, ' + store.actions.length + ' actions, ' + store.feedback.recommendations.length + ' recommendations)');
    } else {
      store = JSON.parse(JSON.stringify(DEFAULT_STORE));
      save();
      console.log('  ✓ Data store initialized (' + store.graph.nodes.length + ' nodes, ' + store.graph.edges.length + ' edges)');
    }
  } catch (e) {
    console.error('  ✗ Data store error:', e.message);
    store = JSON.parse(JSON.stringify(DEFAULT_STORE));
  }
  return store;
}

function save() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('  ✗ Data store save error:', e.message);
  }
}

// Auto-save every 30s
setInterval(() => { if (store) save(); }, 30000);

// Graph helpers
function getNode(id) { return store.graph.nodes.find(n => n.id === id); }
function updateNode(id, updates) { const n = getNode(id); if (n) Object.assign(n, updates); return n; }
function getEdgesForNode(id) { return store.graph.edges.filter(e => e.source === id || e.target === id); }
function getDownstream(nodeId) {
  const visited = new Set();
  function walk(id) { if (visited.has(id)) return; visited.add(id); store.graph.edges.filter(e => e.source === id).forEach(e => walk(e.target)); }
  walk(nodeId);
  return [...visited];
}
function getUpstream(nodeId) {
  const visited = new Set();
  function walk(id) { if (visited.has(id)) return; visited.add(id); store.graph.edges.filter(e => e.target === id).forEach(e => walk(e.source)); }
  walk(nodeId);
  return [...visited];
}

// Action helpers
function logAction(action) { store.actions.push({ ...action, timestamp: Date.now() }); save(); return action; }
function getRecentActions(n) { return store.actions.slice(-(n || 50)); }

// Feedback helpers
function logRecommendation(query, answer, confidence, userFollowed) {
  store.feedback.recommendations.push({ query, answer, confidence, userFollowed: userFollowed || null, timestamp: Date.now() });
  save();
}
function logOutcome(recommendationId, outcome) {
  store.feedback.outcomes.push({ recommendationId, ...outcome, timestamp: Date.now() });
  save();
}

// Feed helpers
function updateFeed(name, data) {
  if (!store.feeds[name]) store.feeds[name] = [];
  store.feeds[name].push({ timestamp: new Date().toISOString(), records: data });
  if (store.feeds[name].length > 200) store.feeds[name].splice(0, store.feeds[name].length - 200);
  save();
}

function addNode(node) {
  if (!store.graph.nodes.find(n => n.id === node.id)) {
    store.graph.nodes.push(node);
    save();
  }
  return node;
}

function setStoreField(key, value) {
  store[key] = value;
  save();
}

function getGraphContext() {
  const nodes = store.graph.nodes;
  const edges = store.graph.edges;
  return `${nodes.length} nodes, ${edges.length} edges. ` +
    nodes.filter(n => n.attributes?.risk > 60 || n.risk > 60).map(n => n.name || n.id).join(', ') + ' high risk.';
}

function logReconciliation(entry) {
  if (!store.reconciliationLog) store.reconciliationLog = [];
  store.reconciliationLog.push({ ...entry, timestamp: Date.now() });
  save();
}

// Simulation helpers
function logSimulation(params, results) {
  const sim = { params, results, timestamp: Date.now() };
  store.simulations.push(sim);
  save();
  return sim;
}

// Expose store for WebSocket broadcasts
function getStore() { return store; }

module.exports = { load, save, getStore, getNode, updateNode, getEdgesForNode, getDownstream, getUpstream, logAction, getRecentActions, logRecommendation, logOutcome, updateFeed, logSimulation, addNode, setStoreField, getGraphContext, logReconciliation };
