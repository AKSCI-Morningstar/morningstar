const { Router } = require('express');
const feedbackModel = require('../models/feedback');
const logger = require('../utils/logger');
const { broadcast } = require('./websocket');

const router = Router();

async function bridgeBuy(params) {
  const { partId, supplier, quantity, urgency } = params;
  if (!partId || !supplier) return { success: false, error: 'partId and supplier required' };
  const poNumber = `PO-${String(Date.now()).slice(-5)}`;
  const totalCost = (quantity || 100) * 4200;
  return {
    success: true, poNumber, totalCost, status: 'PENDING_APPROVAL',
    message: `Bridge buy PO ${poNumber} for ${quantity || 100} units ${partId} from ${supplier} (${urgency || 'standard'})`,
    approvals: [
      { role: 'procurement-lead', status: 'PENDING', deadline: new Date(Date.now() + 86400000).toISOString() },
      { role: 'program-manager', status: 'PENDING', deadline: new Date(Date.now() + 86400000).toISOString() },
    ],
    imsUpdate: { partId, status: 'BRIDGE_BUY_PENDING', estimatedDelivery: new Date(Date.now() + 14 * 86400000).toISOString() },
  };
}

async function escalationMemo(params) {
  const { supplierId, reason, deadline } = params;
  if (!supplierId) return { success: false, error: 'supplierId required' };
  const memoId = `ESC-${String(Date.now()).slice(-5)}`;
  return {
    success: true, memoId,
    message: `Escalation memo ${memoId} for ${supplierId}: ${reason || 'Performance issue'}`,
    to: 'DCMA Program Office', cc: ['procurement@aksci.com', 'quality@aksci.com'],
    subject: `URGENT: ${supplierId.replace(/_t$/, '')}`,
    deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString(), status: 'DRAFT',
  };
}

async function supplierEmail(params) {
  const { supplierEmail, subject, body } = params;
  if (!supplierEmail) return { success: false, error: 'supplierEmail required' };
  return { success: true, message: `Email sent to ${supplierEmail}`, subject: subject || 'AKSCI Notification', sentAt: new Date().toISOString() };
}

async function updateIMS(params) {
  const { partId, status, notes } = params;
  if (!partId) return { success: false, error: 'partId required' };
  return { success: true, message: `IMS updated for ${partId}: ${status || 'STATUS_CHANGED'}`, partId, newStatus: status || 'STATUS_CHANGED', timestamp: new Date().toISOString() };
}

async function approve(params) {
  const { workflowId, approver } = params;
  if (!workflowId) return { success: false, error: 'workflowId required' };
  return { success: true, message: `Approved ${workflowId} by ${approver || 'system'}`, workflowId, status: 'APPROVED', timestamp: new Date().toISOString() };
}

const handlers = { 'bridge-buy': bridgeBuy, 'escalation-memo': escalationMemo, 'supplier-email': supplierEmail, 'update-ims': updateIMS, 'approve': approve };

router.post('/:type', async (req, res) => {
  const { type } = req.params;
  const handler = handlers[type];
  if (!handler) return res.status(400).json({ success: false, error: `Unknown action: ${type}` });

  try {
    const result = await handler(req.body);
    feedbackModel.logAction(type, req.body, result, result.success ? 'completed' : 'failed');
    if (result.success) broadcast('action:executed', { type, result });
    res.json(result);
  } catch (err) {
    logger.error({ err, type }, 'Action failed');
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/log', async (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  res.json({ actions: await feedbackModel.getActions(limit) });
});

module.exports = router;
