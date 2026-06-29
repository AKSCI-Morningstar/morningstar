let pino;
try {
  pino = require('pino');
} catch {
  pino = null;
}

const level = process.env.LOG_LEVEL || 'info';

function createLogger() {
  if (pino) {
    return pino({ level, transport: { target: 'pino-pretty', options: { colorize: true } } });
  }
  // Fallback console logger
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[level] ?? 2;
  const noop = () => {};
  return {
    error: currentLevel >= 0 ? (...args) => console.error('[ERROR]', ...args) : noop,
    warn:  currentLevel >= 1 ? (...args) => console.warn('[WARN]', ...args) : noop,
    info:  currentLevel >= 2 ? (...args) => console.log('[INFO]', ...args) : noop,
    debug: currentLevel >= 3 ? (...args) => console.log('[DEBUG]', ...args) : noop,
  };
}

module.exports = createLogger();
