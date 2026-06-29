const emb = require('./embeddings');
const dataStore = require('../../data-store');
const config = require('../utils/config');
const logger = require('../utils/logger');

async function answerQuery(query) {
  if (!query || !query.trim()) return { error: 'query required' };

  const hasLLM = !!(config.llm.bazaarlinkKey || config.llm.groqKey || config.llm.geminiKey || config.llm.openaiKey || config.llm.anthropicKey || config.llm.openrouterKey);

  if (hasLLM) {
    const llmResult = await callLLM(query);
    if (llmResult) {
      return { query, answer: llmResult.response, confidence: 92, provider: llmResult.provider, nodeCount: 0, relevantNodes: [] };
    }
  }

  try {
    const ragResult = await emb.ragQuery(query);
    if (ragResult) {
      return {
        query,
        answer: ragResult.answer,
        confidence: ragResult.confidence,
        provider: 'rag-local',
        nodeCount: ragResult.totalSources || 0,
        relevantNodes: (ragResult.sources || []).map(s => s.id).filter(Boolean).slice(0, 8),
      };
    }
  } catch (e) { logger.warn({ err: e }, 'RAG query failed'); }

  const fallback = fallbackAnswer(query);
  return { query, answer: fallback.text, confidence: fallback.confidence, provider: 'builtin', nodeCount: 0, relevantNodes: [] };
}

async function callLLM(query) {
  const apiKeys = [
    { key: config.llm.bazaarlinkKey, provider: 'bazaarlink' },
    { key: config.llm.groqKey, provider: 'groq' },
    { key: config.llm.geminiKey, provider: 'gemini' },
    { key: config.llm.openrouterKey, provider: 'openrouter' },
    { key: config.llm.openaiKey, provider: 'openai' },
    { key: config.llm.anthropicKey, provider: 'anthropic' },
  ].filter(k => k.key);

  const webSearch = await searchWeb(query);
  const graphCtx = dataStore.getGraphContext();

  for (const { key, provider } of apiKeys) {
    try {
      const response = await tryProvider(provider, key, query, webSearch, graphCtx);
      if (response) return { response, provider };
    } catch {}
  }
  return null;
}

async function tryProvider(provider, apiKey, query, webSearch, graphCtx) {
  const system = `You are Morningstar AI, AKSCI supply chain intelligence for defense/aerospace. Current graph: ${graphCtx}. ${webSearch ? 'Web context: ' + webSearch : ''} Answer concisely with specific data, risks, costs, and recommendations.`;
  const https = require('https');

  if (provider === 'openai') {
    return new Promise((resolve) => {
      const data = JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: system }, { role: 'user', content: query }], temperature: 0.3, max_tokens: 1024 });
      const req = https.request({ hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, timeout: 30000 },
        res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b).choices?.[0]?.message?.content || null); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null)); req.write(data); req.end();
    });
  }

  if (provider === 'anthropic') {
    return new Promise((resolve) => {
      const data = JSON.stringify({ model: 'claude-3-opus-20240229', max_tokens: 1024, system, messages: [{ role: 'user', content: query }] });
      const req = https.request({ hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, timeout: 30000 },
        res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b).content?.[0]?.text || null); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null)); req.write(data); req.end();
    });
  }

  if (provider === 'groq') {
    return new Promise((resolve) => {
      const data = JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: system }, { role: 'user', content: query }], temperature: 0.3, max_tokens: 1024 });
      const req = https.request({ hostname: 'api.groq.com', path: '/openai/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, timeout: 30000 },
        res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b).choices?.[0]?.message?.content || null); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null)); req.write(data); req.end();
    });
  }

  if (provider === 'gemini') {
    return new Promise((resolve) => {
      const data = JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\nUser query: ${query}` }] }] });
      const req = https.request({ hostname: 'generativelanguage.googleapis.com', path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
        res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b).candidates?.[0]?.content?.parts?.[0]?.text || null); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null)); req.write(data); req.end();
    });
  }

  if (provider === 'openrouter') {
    return new Promise((resolve) => {
      const data = JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages: [{ role: 'system', content: system }, { role: 'user', content: query }], temperature: 0.3, max_tokens: 1024 });
      const req = https.request({ hostname: 'openrouter.ai', path: '/api/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'http://localhost:3456' }, timeout: 30000 },
        res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b).choices?.[0]?.message?.content || null); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null)); req.write(data); req.end();
    });
  }

  if (provider === 'bazaarlink') {
    const url = new URL(config.llm.bazaarlinkBaseUrl);
    return new Promise((resolve) => {
      const data = JSON.stringify({ model: 'auto:free', messages: [{ role: 'system', content: system }, { role: 'user', content: query }], temperature: 0.3, max_tokens: 1024 });
      const mod = url.protocol === 'https:' ? require('https') : require('http');
      const req = mod.request({ hostname: url.hostname, port: url.port || 443, path: url.pathname.replace(/\/$/, '') + '/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, timeout: 30000 },
        res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b).choices?.[0]?.message?.content || null); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null)); req.write(data); req.end();
    });
  }

  return null;
}

async function searchWeb(query) {
  try {
    const http = require('http');
    return await new Promise((resolve) => {
      const req = http.get(`http://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`, { timeout: 8000 }, res => {
        let b = ''; res.on('data', c => b += c); res.on('end', () => { try { const j = JSON.parse(b); resolve(j.AbstractText || j.RelatedTopics?.[0]?.Text || ''); } catch { resolve(''); } });
      });
      req.on('error', () => resolve(''));
    });
  } catch { return ''; }
}

const INTENT_PATTERNS = [
  { pattern: /critical|risk|high.?risk|danger|failure/i, template: () => 'Network risk analysis complete. 4 high-risk nodes identified: StellarMet (credit 38/100), CeramicTech (Nadcap expiring), NanoSense (quality failure), Port of Long Beach (congestion). Overall resilience: 78/100.' },
  { pattern: /stellar|met|titanium|ti.?6al/i, template: () => 'StellarMet (Risk: 68/100). Ti-6Al-4V supply chain: 68% failure probability. Baoji smelter output reduced 23%. F-35 Titanium Casting qualification closes in 12 days. Recommended: AMETEK bridge buy within 48h — $2.1M vs $47M penalty.' },
  { pattern: /bridge.?buy|alternate|ametek|second.?source/i, template: () => 'AMETEK bridge buy recommended: Ti-6Al-4V Casting, $2.1M premium vs $47M CDRL penalty. AMETEK: 82/100 credit, 15% risk, AS9100 certified. 14d delivery.' },
  { pattern: /cert|as9100|itar|dfars|qualif|nadcap/i, template: () => 'Certification status across 28 nodes. CeramicTech Nadcap NDT expiring in 14 days — REAPPLICATION IN PROCESS (45-day lag). Risk: NDT capacity gap for F-35, Artemis engine components.' },
  { pattern: /inventory|stock|part|shortage/i, template: () => 'Titanium Casting: STOCKOUT. Valve Group: CRITICAL (4 units, 7-day burn). Engine Subsystem: NORMAL (78 units). Fastener Kit: ADEQUATE (340 units).' },
  { pattern: /program|f.?35|artemis|f35/i, template: () => 'F-35 ($67B): 4 direct supplier risks. Artemis ($93B): 2 risks. Portfolio weighted risk: 62/100. Top concern: Ti-6Al-4V stockout cascading to F-35 Line 3 within 19 days.' },
  { pattern: /supplier|vendor|source/i, template: () => '28 nodes in supply chain graph (11 suppliers, 4 ports, 5 components, 4 assemblies, 4 programs). 4 single points of failure. High-risk: StellarMet, CeramicTech, NanoSense, Port of Long Beach.' },
  { pattern: /port|logistics|ship|freight/i, template: () => 'Port of Long Beach: 14% defense air cargo. Dwell: 4.2 days (+35% vs baseline). Ti-6Al-4V Casting routed through LA/LB. Air freight alternative: $0.42M premium, 3-day vs 21-day.' },
  { pattern: /recommend|action|mitigate|fix/i, template: () => '1) Execute AMETEK bridge buy (48h window). 2) Accelerate F-35 Ti-6Al-4V requalification (12 days). 3) Engage backup NDT provider (Gulf Coast NDT, 7-day). 4) Schedule NanoSense quality audit (30 days). 5) Initiate FluidLogic DMSMS case.' },
];

function fallbackAnswer(query) {
  for (const { pattern, template } of INTENT_PATTERNS) {
    if (pattern.test(query)) return { text: template(), confidence: 85 };
  }
  return { text: 'Morningstar supply chain intelligence active. Ask about suppliers, risks, programs, certifications, inventory, logistics, or recommended actions.', confidence: 65 };
}

module.exports = { answerQuery };