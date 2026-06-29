const logger = require('../utils/logger');

let admin, firebaseApp;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  const config = require('../utils/config');
  if (!config.firebase?.serviceAccountPath) return null;
  try {
    admin = require('firebase-admin');
    const serviceAccount = require(config.firebase.serviceAccountPath);
    firebaseApp = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return firebaseApp;
  } catch { return null; }
}

async function sendPush(token, title, body, data = {}) {
  const app = getFirebaseApp();
  if (!app) return { success: false, error: 'Firebase not configured' };
  try {
    const response = await admin.messaging().send({
      token, notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
    return { success: true, messageId: response };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendPushAll(title, body, data = {}) {
  const app = getFirebaseApp();
  if (!app) return { success: false, error: 'Firebase not configured' };
  try {
    const db = require('../db');
    const result = await db.query('SELECT token FROM device_tokens');
    const tokens = result.rows.map(r => r.token);
    if (tokens.length === 0) return { success: true, sentCount: 0 };
    const response = await admin.messaging().sendEachForMulticast({
      tokens, notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
    return { success: true, sentCount: response.successCount, failedCount: response.failureCount };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function registerToken(token, platform = 'web') {
  try {
    const db = require('../db');
    await db.query('INSERT INTO device_tokens (token, platform) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING', [token, platform]);
    return { success: true };
  } catch {
    logger.warn('Device token registration failed (DB unavailable)');
    return { success: false, error: 'DB not available' };
  }
}

module.exports = { sendPush, sendPushAll, registerToken };
