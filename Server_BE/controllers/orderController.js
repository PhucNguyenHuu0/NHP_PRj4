const db = require('../config/database');
const { sendEmail } = require('../services/emailService');
const { logActivity } = require('../utils/logger');

const getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, c.nhp_name as customer_name 
      FROM nhp_orders o 
      LEFT JOIN nhp_customers c ON o.nhp_customerId = c.nhp_id
    `);
    console.log('Orders fetched:', orders);
    if (orders.length === 0) {
      return res.status(200).json({ message: 'No orders found', data: [] });
    }
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await db.query(`
      SELECT oi.*, p.nhp_name as product_name 
      FROM nhp_order_items oi 
      LEFT JOIN nhp_products p ON oi.nhp_productId = p.nhp_id 
      WHERE oi.nhp_orderId = ?
    `, [id]);
    console.log('Order details fetched:', items);
    if (items.length === 0) {
      return res.status(200).json({ message: 'No order details found', data: [] });
    }
    res.json(items);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Failed to fetch order details', details: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { nhp_customerId, nhp_promotionCode, items } = req.body;
    let totalPrice = 0;

    for (const item of items) {
      const [product] = await db.query('SELECT nhp_price FROM nhp_products WHERE nhp_id = ?', [item.nhp_productId]);
      totalPrice += product[0].nhp_price * item.nhp_quantity;
    }

    let promotionId = null;
    if (nhp_promotionCode) {
      const [promotions] = await db.query('SELECT * FROM nhp_promotions WHERE nhp_code = ? AND NOW() BETWEEN nhp_startDate AND nhp_endDate', [nhp_promotionCode]);
      const promotion = promotions[0];
      if (promotion) {
        promotionId = promotion.nhp_id;
        if (promotion.nhp_discountType === 'PERCENTAGE') {
          totalPrice -= (totalPrice * promotion.nhp_discountValue) / 100;
        } else {
          totalPrice -= promotion.nhp_discountValue;
        }
      }
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_orders (nhp_customerId, nhp_totalPrice, nhp_status, nhp_promotionId, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [nhp_customerId, totalPrice, 'PENDING', promotionId, createdAt, updatedAt]
    );

    const orderId = result.insertId;
    for (const item of items) {
      await db.query(
        'INSERT INTO nhp_order_items (nhp_orderId, nhp_productId, nhp_attributeId, nhp_quantity, nhp_price, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.nhp_productId, item.nhp_attributeId, item.nhp_quantity, item.nhp_price, createdAt, updatedAt]
      );
      await db.query('UPDATE nhp_product_attributes SET nhp_stock = nhp_stock - ? WHERE nhp_id = ?', [item.nhp_quantity, item.nhp_attributeId]);
      await db.query('UPDATE nhp_products SET nhp_stock = nhp_stock - ? WHERE nhp_id = ?', [item.nhp_quantity, item.nhp_productId]);
      await db.query(
        'INSERT INTO nhp_inventory_logs (nhp_productId, nhp_attributeId, nhp_type, nhp_quantity, nhp_createdAt) VALUES (?, ?, ?, ?, ?)',
        [item.nhp_productId, item.nhp_attributeId, 'EXPORT', item.nhp_quantity, createdAt]
      );
    }

    const [customer] = await db.query('SELECT nhp_email FROM nhp_customers WHERE nhp_id = ?', [nhp_customerId]);
    await sendEmail(customer[0].nhp_email, 'New Order', `Your order #${orderId} has been created. Total: ${totalPrice} VND`);
    await logActivity(req.user.id, 'CREATE_ORDER', `Created order #${orderId}`);
    res.status(201).json({ orderId, totalPrice });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(400).json({ error: 'Failed to create order', details: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { nhp_status } = req.body;
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE nhp_orders SET nhp_status = ?, nhp_updatedAt = ? WHERE nhp_id = ?',
      [nhp_status, updatedAt, id]
    );
    const [updatedOrder] = await db.query('SELECT * FROM nhp_orders WHERE nhp_id = ?', [id]);
    const [customer] = await db.query('SELECT nhp_email FROM nhp_customers WHERE nhp_id = ?', [updatedOrder[0].nhp_customerId]);
    await sendEmail(customer[0].nhp_email, 'Order Update', `Your order #${id} status has been updated to ${nhp_status}`);
    await logActivity(req.user.id, 'UPDATE_ORDER', `Updated order #${id} to ${nhp_status}`);
    res.json(updatedOrder[0]);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(400).json({ error: 'Failed to update order', details: err.message });
  }
};

module.exports = {
  getOrders,
  getOrderDetails,
  createOrder,
  updateOrder,
};