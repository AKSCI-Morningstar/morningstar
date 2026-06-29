const logger = require('../utils/logger');

// Simple in-memory queue (replace with Bull + Redis for production)
const queues = {};

function add(queueName, job) {
  if (!queues[queueName]) queues[queueName] = [];
  queues[queueName].push({ ...job, id: `${queueName}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, addedAt: Date.now() });
  logger.debug({ queueName, jobId: job.id }, 'Job queued');

  // Process immediately (simple sync queue)
  processQueue(queueName);
  return { queued: true, id: job.id };
}

async function processQueue(queueName) {
  const q = queues[queueName];
  if (!q || q.length === 0) return;

  const job = q.shift();
  try {
    if (typeof job.handler === 'function') {
      await job.handler(job.data);
      logger.info({ queueName, jobId: job.id }, 'Job completed');
    }
  } catch (err) {
    logger.error({ err, queueName, jobId: job.id }, 'Job failed');
  }

  if (q.length > 0) processQueue(queueName);
}

function getStatus(queueName) {
  const q = queues[queueName];
  return { queueName, pending: q?.length || 0 };
}

module.exports = { add, getStatus };
