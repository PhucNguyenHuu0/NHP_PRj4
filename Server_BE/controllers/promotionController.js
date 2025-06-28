const db = require('../config/database');
const { logActivity } = require('../utils/logger');

const getPromotions = async (req, res) => {
  try {
    const [promotions] = await db.query('SELECT * FROM nhp_promotions');
    console.log('Promotions fetched:', promotions);
    if (promotions.length === 0) {
      return res.status(200).json({ message: 'No promotions found', data: [] });
    }
    res.json(promotions);
  } catch (err) {
    console.error('Error fetching promotions:', err);
    res.status(500).json({ error: 'Failed to fetch promotions', details: err.message });
  }
};

const createPromotion = async (req, res) => {
  try {
    const { nhp_code, nhp_discountType, nhp_discountValue, nhp_startDate, nhp_endDate } = req.body;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_promotions (nhp_code, nhp_discountType, nhp_discountValue, nhp_startDate, nhp_endDate, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nhp_code, nhp_discountType, nhp_discountValue, nhp_startDate, nhp_endDate, createdAt, updatedAt]
    );
    const [newPromotion] = await db.query('SELECT * FROM nhp_promotions WHERE nhp_id = ?', [result.insertId]);
    await logActivity(req.user.id, 'CREATE_PROMOTION', `Created promotion ${nhp_code}`);
    res.status(201).json(newPromotion[0]);
  } catch (err) {
    console.error('Error creating promotion:', err);
    res.status(400).json({ error: 'Failed to create promotion', details: err.message });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nhp_code, nhp_discountType, nhp_discountValue, nhp_startDate, nhp_endDate } = req.body;
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE nhp_promotions SET nhp_code = ?, nhp_discountType = ?, nhp_discountValue = ?, nhp_startDate = ?, nhp_endDate = ?, nhp_updatedAt = ? WHERE nhp_id = ?',
      [nhp_code, nhp_discountType, nhp_discountValue, nhp_startDate, nhp_endDate, updatedAt, id]
    );
    const [updatedPromotion] = await db.query('SELECT * FROM nhp_promotions WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'UPDATE_PROMOTION', `Updated promotion ${nhp_code}`);
    res.json(updatedPromotion[0]);
  } catch (err) {
    console.error('Error updating promotion:', err);
    res.status(400).json({ error: 'Failed to update promotion', details: err.message });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const [promotion] = await db.query('SELECT * FROM nhp_promotions WHERE nhp_id = ?', [id]);
    await db.query('DELETE FROM nhp_promotions WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_PROMOTION', `Deleted promotion ${promotion[0].nhp_code}`);
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    console.error('Error deleting promotion:', err);
    res.status(400).json({ error: 'Failed to delete promotion', details: err.message });
  }
};

module.exports = {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
};