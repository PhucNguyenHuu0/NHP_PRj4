const db = require('../config/database');
const { logActivity } = require('../utils/logger');

const getInventoryLogs = async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM nhp_inventory_logs');
    console.log('Inventory logs fetched:', logs);
    if (logs.length === 0) {
      return res.status(200).json({ message: 'No inventory logs found', data: [] });
    }
    res.json(logs);
  } catch (err) {
    console.error('Error fetching inventory logs:', err);
    res.status(500).json({ error: 'Failed to fetch inventory logs', details: err.message });
  }
};

const importInventory = async (req, res) => {
  try {
    const { nhp_productId, nhp_attributeId, nhp_quantity } = req.body;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'INSERT INTO nhp_inventory_logs (nhp_productId, nhp_attributeId, nhp_type, nhp_quantity, nhp_createdAt) VALUES (?, ?, ?, ?, ?)',
      [nhp_productId, nhp_attributeId, 'IMPORT', nhp_quantity, createdAt]
    );
    await db.query('UPDATE nhp_product_attributes SET nhp_stock = nhp_stock + ? WHERE nhp_id = ?', [nhp_quantity, nhp_attributeId]);
    await db.query('UPDATE nhp_products SET nhp_stock = nhp_stock + ? WHERE nhp_id = ?', [nhp_quantity, nhp_productId]);
    await logActivity(req.user.id, 'IMPORT_INVENTORY', `Imported ${nhp_quantity} items for product ${nhp_productId}`);
    res.status(201).json({ message: 'Inventory imported' });
  } catch (err) {
    console.error('Error importing inventory:', err);
    res.status(400).json({ error: 'Failed to import inventory', details: err.message });
  }
};

module.exports = {
  getInventoryLogs,
  importInventory,
};