const db = require('../config/database');
const { logActivity } = require('../utils/logger');

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM nhp_categories');
    console.log('Categories fetched:', categories);
    if (categories.length === 0) {
      return res.status(200).json({ message: 'No categories found', data: [] });
    }
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nhp_name } = req.body;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_categories (nhp_name, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?)',
      [nhp_name, createdAt, updatedAt]
    );
    const [newCategory] = await db.query('SELECT * FROM nhp_categories WHERE nhp_id = ?', [result.insertId]);
    await logActivity(req.user.id, 'CREATE_CATEGORY', `Created category ${nhp_name}`);
    res.status(201).json(newCategory[0]);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(400).json({ error: 'Failed to create category', details: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nhp_name } = req.body;
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE nhp_categories SET nhp_name = ?, nhp_updatedAt = ? WHERE nhp_id = ?',
      [nhp_name, updatedAt, id]
    );
    const [updatedCategory] = await db.query('SELECT * FROM nhp_categories WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'UPDATE_CATEGORY', `Updated category ${nhp_name}`);
    res.json(updatedCategory[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(400).json({ error: 'Failed to update category', details: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [category] = await db.query('SELECT * FROM nhp_categories WHERE nhp_id = ?', [id]);
    await db.query('DELETE FROM nhp_categories WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_CATEGORY', `Deleted category ${category[0].nhp_name}`);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(400).json({ error: 'Failed to delete category', details: err.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};