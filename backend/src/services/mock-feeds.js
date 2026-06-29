const dataStore = require('../../data-store');
const logger = require('../utils/logger');

const INTERVALS = {};

function generateSAPAriba() {
  return {
    source: 'sap_ariba',
    records: [
      { supplierId: 'StellarMet_t', poNumber: 'PO-2024-8472', value: 47000000, status: 'open', leadTimeDays: 120, riskFlag: 'single_source', commodity: 'Titanium Casting', plant: 'Baoji CN' },
      { supplierId: 'Aerocast_Inc_t', poNumber: 'PO-2024-8473', value: 8500000, status: 'open', leadTimeDays: 45, riskFlag: 'none', commodity: 'Investment Casting' },
      { supplierId: 'CeramicTech_t', poNumber: 'PO-2024-8474', value: 3200000, status: 'at_risk', leadTimeDays: 60, riskFlag: 'cert_expiring', commodity: 'Ceramic Matrix Composites' },
      { supplierId: 'NanoSense_t', poNumber: 'PO-2024-8475', value: 5600000, status: 'on_hold', leadTimeDays: 90, riskFlag: 'quality_issue', commodity: 'Sensors' },
      { supplierId: 'FluidLogic_t', poNumber: 'PO-2024-8476', value: 7800000, status: 'open', leadTimeDays: 30, riskFlag: 'none', commodity: 'Fluid Systems' },
      { supplierId: 'AMETEK_t', poNumber: 'PO-2024-8477', value: 2100000, status: 'open', leadTimeDays: 14, riskFlag: 'none', commodity: 'Precision Components' },
      { supplierId: 'QualiMet_t', poNumber: 'PO-2024-8478', value: 3500000, status: 'open', leadTimeDays: 21, riskFlag: 'pma_only', commodity: 'PMA Parts' },
    ],
  };
}

function generateTeamcenter() {
  return {
    source: 'teamcenter',
    records: [
      { partNumber: 'TC-F35-001', partName: 'Titanium Casting', status: 'stockout', bomLevel: 2, program: 'F-35 Program_t', revision: 'C', engineeringChange: 'ECR-2024-112', qualifiedSuppliers: ['StellarMet_t'], pendingQual: ['AMETEK_t'] },
      { partNumber: 'TC-F35-002', partName: 'Engine Subsystem', status: 'active', bomLevel: 1, program: 'F-35 Program_t', revision: 'B', leadTimeDays: 120 },
      { partNumber: 'TC-ART-001', partName: 'Valve Group', status: 'critical', bomLevel: 2, program: 'Artemis Program_t', revision: 'A', quantityRemaining: 4 },
      { partNumber: 'TC-F35-003', partName: 'Fastener Kit', status: 'active', bomLevel: 3, program: 'F-35 Program_t', revision: 'D', quantityOnHand: 340 },
      { partNumber: 'TC-ORI-001', partName: 'PMA Actuator', status: 'active', bomLevel: 2, program: 'Orion Capsule_t', revision: 'B', altSupplier: 'QualiMet_t' },
    ],
  };
}

function generateOutlookCalendar() {
  return {
    source: 'outlook_calendar',
    records: [
      { type: 'qualification_review', title: 'F-35 Ti-6Al-4V Casting Qual Review', date: new Date(Date.now() + 12 * 86400000).toISOString(), organizer: 'AFLCMC', attendees: ['StellarMet', 'AMETEK', 'Lockheed Martin'], status: 'confirmed' },
      { type: 'nadcap_audit', title: 'CeramicTech Nadcap NDT Reapplication', date: new Date(Date.now() + 14 * 86400000).toISOString(), organizer: 'PRI', status: 'in_process' },
      { type: 'program_review', title: 'Artemis Engine PMR', date: new Date(Date.now() + 21 * 86400000).toISOString(), organizer: 'NASA HQ', status: 'tentative' },
      { type: 'quality_audit', title: 'NanoSense Quality Audit', date: new Date(Date.now() + 30 * 86400000).toISOString(), organizer: 'AKSCI QA', status: 'scheduled' },
      { type: 'supplier_summit', title: 'Q4 Defense Supplier Summit', date: new Date(Date.now() + 45 * 86400000).toISOString(), organizer: 'DLA', status: 'announced' },
    ],
  };
}

function generateDNB() {
  return {
    source: 'dnb',
    records: [
      { supplierId: 'StellarMet_t', creditScore: 38, creditLabel: 'High Risk', paymentHistory: 'NET-90 avg 45d late', duns: '42-847-1920', revenue: 120000000, employees: 340, industry: 'Aerospace Metals', riskIndicators: ['concentration', 'geo_political'] },
      { supplierId: 'AMETEK_t', creditScore: 82, creditLabel: 'Low Risk', paymentHistory: 'NET-30 avg 2d early', duns: '80-375-6291', revenue: 4500000000, employees: 18000, industry: 'Precision Manufacturing' },
      { supplierId: 'Aerocast_Inc_t', creditScore: 45, creditLabel: 'Moderate Risk', paymentHistory: 'NET-60 avg 15d late', duns: '73-518-4029', revenue: 89000000, employees: 210, industry: 'Investment Casting' },
      { supplierId: 'CeramicTech_t', creditScore: 55, creditLabel: 'Moderate Risk', paymentHistory: 'NET-45 avg 10d late', duns: '19-384-7150', revenue: 65000000, employees: 180, industry: 'Ceramics' },
      { supplierId: 'NanoSense_t', creditScore: 30, creditLabel: 'High Risk', paymentHistory: 'NET-30 avg 60d late', duns: '55-901-2834', revenue: 42000000, employees: 95, industry: 'Sensors', riskIndicators: ['quality_issues', 'liquidity'] },
      { supplierId: 'FluidLogic_t', creditScore: 72, creditLabel: 'Low Risk', paymentHistory: 'NET-45 avg 5d early', duns: '61-472-8301', revenue: 210000000, employees: 520, industry: 'Fluid Systems' },
      { supplierId: 'QualiMet_t', creditScore: 82, creditLabel: 'Low Risk', paymentHistory: 'NET-30 avg 0d', duns: '38-156-7924', revenue: 95000000, employees: 240, industry: 'PMA Parts' },
    ],
  };
}

function generateSPIREfeed() {
  return { source: 'spire_gov', contracts: generateSAPAriba().records.map(r => ({ supplierId: r.supplierId, value: r.value, status: r.status === 'open' ? 'active' : r.status })) };
}

function generateSAMfeed() {
  return { source: 'sam_gov', entities: [
    { supplierId: 'StellarMet_t', status: 'active', excluded: false, cageCode: '3F4G7', samExpiration: '2025-06-30', businessSize: 'small', naics: '331491' },
    { supplierId: 'AMETEK_t', status: 'active', excluded: false, cageCode: '8H2J1', samExpiration: '2025-12-31', businessSize: 'large', naics: '332710' },
    { supplierId: 'CeramicTech_t', status: 'active', excluded: false, cageCode: '1B9K5', samExpiration: '2025-09-15', businessSize: 'small', naics: '327110' },
    { supplierId: 'NanoSense_t', status: 'suspended', excluded: true, cageCode: '4D6M2', samExpiration: '2024-03-01', businessSize: 'small', naics: '334513', exclusionReason: 'Quality non-compliance' },
    { supplierId: 'Aerocast_Inc_t', status: 'active', excluded: false, cageCode: '7N3P8', samExpiration: '2025-04-30', businessSize: 'small', naics: '331512' },
  ]};
}

function startFeed(feedId, generatorFn, intervalMs = 60000) {
  if (INTERVALS[feedId]) clearInterval(INTERVALS[feedId]);
  INTERVALS[feedId] = setInterval(() => {
    try {
      const data = generatorFn();
      const store = dataStore.getStore();
      if (!store.feeds) store.feeds = {};
      if (!store.feeds[feedId]) store.feeds[feedId] = [];
      store.feeds[feedId].push({ timestamp: new Date().toISOString(), records: data.records || data.contracts || data.entities || [] });
      if (store.feeds[feedId].length > 100) store.feeds[feedId].splice(0, store.feeds[feedId].length - 100);
      logger.info({ feed: feedId }, 'Feed tick');
    } catch (e) { logger.warn({ err: e, feed: feedId }, 'Feed error'); }
  }, intervalMs);
  return { feedId, intervalMs, status: 'started' };
}

function stopFeed(feedId) {
  if (INTERVALS[feedId]) { clearInterval(INTERVALS[feedId]); delete INTERVALS[feedId]; }
  return { feedId, status: 'stopped' };
}

function startAllFeeds() {
  return {
    sap_ariba: startFeed('sap_ariba', generateSAPAriba, 120000),
    teamcenter: startFeed('teamcenter', generateTeamcenter, 180000),
    outlook_calendar: startFeed('outlook_calendar', generateOutlookCalendar, 300000),
    dnb: startFeed('dnb', generateDNB, 360000),
    spire_gov: startFeed('spire_gov', generateSPIREfeed, 120000),
    sam_gov: startFeed('sam_gov', generateSAMfeed, 120000),
  };
}

function stopAllFeeds() {
  Object.keys(INTERVALS).forEach(stopFeed);
  return { status: 'all_stopped' };
}

function getFeedsSummary() {
  const store = dataStore.getStore();
  return {
    activeFeeds: Object.keys(INTERVALS),
    storedFeeds: Object.keys(store.feeds || {}).reduce((acc, f) => { acc[f] = (store.feeds[f] || []).length; return acc; }, {}),
  };
}

function ingestAllDemo() {
  const results = {};
  [generateSAPAriba, generateTeamcenter, generateOutlookCalendar, generateDNB, generateSPIREfeed, generateSAMfeed].forEach(fn => {
    const data = fn();
    const feedName = data.source || fn.name;
    const records = data.records || data.contracts || data.entities || [];
    if (!dataStore.getStore().feeds) dataStore.getStore().feeds = {};
    if (!dataStore.getStore().feeds[feedName]) dataStore.getStore().feeds[feedName] = [];
    dataStore.getStore().feeds[feedName].push({ timestamp: new Date().toISOString(), records });
    results[feedName] = { ingested: records.length };
  });
  return results;
}

module.exports = { generateSAPAriba, generateTeamcenter, generateOutlookCalendar, generateDNB, generateSPIREfeed, generateSAMfeed, startFeed, stopFeed, startAllFeeds, stopAllFeeds, getFeedsSummary, ingestAllDemo };