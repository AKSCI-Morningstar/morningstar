const { WebSocketServer } = require('ws');
const logger = require('../utils/logger');

let wss = null;
let broadcastFn = null;
let wssCount = 0;

function setupWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  broadcastFn = (type, data) => {
    if (!wss) return;
    const msg = JSON.stringify({ type, data, timestamp: Date.now() });
    wss.clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
  };

  wss.on('connection', (ws, req) => {
    wssCount++;
    logger.info('WebSocket client connected');
    ws.on('close', () => { wssCount--; });
    ws.send(JSON.stringify({ type: 'connected', data: { status: 'ok', timestamp: Date.now() } }));

    ws.on('message', (msg) => {
      try {
        const p = JSON.parse(msg.toString());
        if (p.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
        if (p.type === 'subscribe' && p.channel === 'graph') {
          const dataStore = require('../../data-store');
          ws.send(JSON.stringify({ type: 'graph:update', data: dataStore.getStore().graph }));
        }
      } catch {}
    });

    ws.on('close', () => logger.info('WebSocket client disconnected'));
  });

  logger.info('WebSocket server ready at /ws');
}

function broadcast(type, data) {
  if (broadcastFn) broadcastFn(type, data);
}

module.exports = { setupWebSocket, broadcast, wssCount: () => wssCount };
