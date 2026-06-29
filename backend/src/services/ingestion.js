const dataStore = require('../../data-store');
const logger = require('../utils/logger');

async function ingestSPIRE(contracts) {
  if (!contracts?.length) return { success: false, error: 'contracts required' };
  for (const c of contracts) {
    dataStore.updateFeed('spire', [c]);
    const node = dataStore.getNode(c.supplierId);
    if (node) dataStore.updateNode(c.supplierId, { contractValue: c.value, contractStatus: c.status, lastSpireUpdate: new Date().toISOString() });
  }
  logger.info({ count: contracts.length }, 'SPIRE ingested');
  return { success: true, recordsIngested: contracts.length, affectedNodes: contracts.filter(c => dataStore.getNode(c.supplierId)).length };
}

async function ingestSAM(entities) {
  if (!entities?.length) return { success: false, error: 'entities required' };
  for (const e of entities) {
    dataStore.updateFeed('sam', [e]);
    const node = dataStore.getNode(e.supplierId);
    if (node) dataStore.updateNode(e.supplierId, { samStatus: e.status, exclusion: e.excluded, lastSamUpdate: new Date().toISOString() });
  }
  logger.info({ count: entities.length }, 'SAM.gov ingested');
  return { success: true, recordsIngested: entities.length, excludedCount: entities.filter(e => e.excluded).length };
}

async function ingestDNB(reports) {
  if (!reports?.length) return { success: false, error: 'reports required' };
  for (const r of reports) {
    dataStore.updateFeed('dnb', [r]);
    const node = dataStore.getNode(r.supplierId);
    if (node) dataStore.updateNode(r.supplierId, { creditScore: r.creditScore, creditLabel: r.creditLabel, dnbUpdated: new Date().toISOString() });
  }
  logger.info({ count: reports.length }, 'D&B ingested');
  return { success: true, recordsIngested: reports.length };
}

function getFeedStatus() {
  return { feeds: dataStore.getStore().feeds || {} };
}

function generateDemoData() {
  return {
    spire: [
      { supplierId: 'StellarMet_t', value: 47000000, status: 'active' },
      { supplierId: 'AMETEK_t', value: 2100000, status: 'active' },
      { supplierId: 'Aerocast_Inc_t', value: 8500000, status: 'active' },
    ],
    sam: [
      { supplierId: 'StellarMet_t', status: 'active', excluded: false },
      { supplierId: 'FluidLogic_t', status: 'active', excluded: false },
    ],
    dnb: [
      { supplierId: 'StellarMet_t', creditScore: 38, creditLabel: 'High Risk' },
      { supplierId: 'AMETEK_t', creditScore: 82, creditLabel: 'Low Risk' },
    ],
  };
}

module.exports = { ingestSPIRE, ingestSAM, ingestDNB, getFeedStatus, generateDemoData };
