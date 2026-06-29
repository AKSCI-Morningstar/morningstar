const { query } = require('../db');
const dataStore = require('../../data-store');

async function logRecommendation(query, answer, confidence, userFollowed) {
  try {
    const r = await query(
      'INSERT INTO recommendations (query, answer, confidence, provider, user_followed) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [query, answer, confidence || 0, 'system', userFollowed !== undefined ? userFollowed : null]
    );
    return { success: true, id: r.rows[0].id };
  } catch {
    dataStore.logRecommendation(query, answer, confidence, userFollowed);
    return { success: true, id: Date.now() };
  }
}

async function logOutcome(recommendationId, data) {
  try {
    await query(
      'INSERT INTO outcomes (recommendation_id, on_time_delivery, cost_variance, quality_score, notes) VALUES ($1, $2, $3, $4, $5)',
      [recommendationId || null, data.onTimeDelivery || false, data.costVariance || 0, data.qualityScore || 0, data.notes || '']
    );
    return { success: true };
  } catch {
    dataStore.logOutcome(String(recommendationId), data);
    return { success: true };
  }
}

async function logAction(actionType, payload, result, status) {
  try {
    await query(
      'INSERT INTO actions (action_type, payload, result, status) VALUES ($1, $2, $3, $4)',
      [actionType, JSON.stringify(payload), JSON.stringify(result), status || 'completed']
    );
  } catch {
    dataStore.getStore().actions.push({ type: actionType, payload, result, status, performed_at: new Date().toISOString() });
  }
}

async function getRecommendations(limit = 25) {
  try {
    const r = await query(`
      SELECT r.id, r.query, r.answer, r.confidence, r.user_followed, r.created_at,
        COALESCE(AVG(o.on_time_delivery::int), 0) AS avg_on_time,
        COALESCE(AVG(o.quality_score), 0) AS avg_quality
      FROM recommendations r LEFT JOIN outcomes o ON o.recommendation_id = r.id
      GROUP BY r.id ORDER BY r.created_at DESC LIMIT $1`, [limit]);
    return { recommendations: r.rows, source: 'postgresql' };
  } catch {
    const store = dataStore.getStore();
    return { recommendations: store.feedback.recommendations.slice(-limit).reverse(), source: 'json' };
  }
}

async function getActions(limit = 50) {
  try {
    const r = await query('SELECT * FROM actions ORDER BY created_at DESC LIMIT $1', [limit]);
    return r.rows;
  } catch {
    return (dataStore.getStore().actions || []).slice(-limit).reverse();
  }
}

module.exports = { logRecommendation, logOutcome, logAction, getRecommendations, getActions };
