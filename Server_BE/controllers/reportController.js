const db = require('../config/database');

const getRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [revenue] = await db.query(`
      SELECT DATE(nhp_createdAt) as date, SUM(nhp_totalPrice) as total 
      FROM nhp_orders 
      WHERE nhp_status = 'COMPLETED' AND nhp_createdAt BETWEEN ? AND ? 
      GROUP BY DATE(nhp_createdAt)
    `, [startDate, endDate]);
    console.log('Revenue fetched:', revenue);
    if (revenue.length === 0) {
      return res.status(200).json({ message: 'No revenue data found', data: [] });
    }
    res.json(revenue);
  } catch (err) {
    console.error('Error fetching revenue:', err);
    res.status(500).json({ error: 'Failed to fetch revenue', details: err.message });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const [topProducts] = await db.query(`
      SELECT p.nhp_name, SUM(oi.nhp_quantity) as totalSold 
      FROM nhp_order_items oi 
      JOIN nhp_products p ON oi.nhp_productId = p.nhp_id 
      JOIN nhp_orders o ON oi.nhp_orderId = o.nhp_id 
      WHERE o.nhp_status = 'COMPLETED' 
      GROUP BY p.nhp_id 
      ORDER BY totalSold DESC 
      LIMIT 5
    `);
    console.log('Top products fetched:', topProducts);
    if (topProducts.length === 0) {
      return res.status(200).json({ message: 'No top products found', data: [] });
    }
    res.json(topProducts);
  } catch (err) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: 'Failed to fetch top products', details: err.message });
  }
};

module.exports = {
  getRevenue,
  getTopProducts,
};