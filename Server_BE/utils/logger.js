const db = require('../config/database');

const logActivity = async (userId, action, details) => {
  try {
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'INSERT INTO nhp_activity_logs (nhp_userId, nhp_action, nhp_details, nhp_createdAt) VALUES (?, ?, ?, ?)',
      [userId, action, details, createdAt]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

module.exports = { logActivity };