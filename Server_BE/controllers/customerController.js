const db = require('../config/database');
const { logActivity } = require('../utils/logger');

const getCustomers = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM nhp_customers');
    console.log('Customers fetched:', customers);
    if (customers.length === 0) {
      return res.status(200).json({ message: 'No customers found', data: [] });
    }
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query('SELECT * FROM nhp_orders WHERE nhp_customerId = ?', [id]);
    console.log('Customer history fetched:', orders);
    if (orders.length === 0) {
      return res.status(200).json({ message: 'No order history found', data: [] });
    }
    res.json(orders);
  } catch (err) {
    console.error('Error fetching customer history:', err);
    res.status(500).json({ error: 'Failed to fetch customer history', details: err.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { nhp_name, nhp_email, nhp_phone, nhp_address } = req.body;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_customers (nhp_name, nhp_email, nhp_phone, nhp_address, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [nhp_name, nhp_email, nhp_phone, nhp_address, createdAt, updatedAt]
    );
    const [newCustomer] = await db.query('SELECT * FROM nhp_customers WHERE nhp_id = ?', [result.insertId]);
    await logActivity(req.user.id, 'CREATE_CUSTOMER', `Created customer ${nhp_name}`);
    res.status(201).json(newCustomer[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(400).json({ error: 'Failed to create customer', details: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { nhp_name, nhp_email, nhp_phone, nhp_address } = req.body;
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE nhp_customers SET nhp_name = ?, nhp_email = ?, nhp_phone = ?, nhp_address = ?, nhp_updatedAt = ? WHERE nhp_id = ?',
      [nhp_name, nhp_email, nhp_phone, nhp_address, updatedAt, id]
    );
    const [updatedCustomer] = await db.query('SELECT * FROM nhp_customers WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'UPDATE_CUSTOMER', `Updated customer ${nhp_name}`);
    res.json(updatedCustomer[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(400).json({ error: 'Failed to update customer', details: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [customer] = await db.query('SELECT * FROM nhp_customers WHERE nhp_id = ?', [id]);
    await db.query('DELETE FROM nhp_customers WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_CUSTOMER', `Deleted customer ${customer[0].nhp_name}`);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(400).json({ error: 'Failed to delete customer', details: err.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};