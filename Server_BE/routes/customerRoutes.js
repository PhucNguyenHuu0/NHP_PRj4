const express = require('express');
const {
  getCustomers,
  getCustomerHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/customers - User:', req.user);
  getCustomers(req, res);
});

router.get('/:id/history', authenticateToken, (req, res) => {
  console.log('GET /api/customers/:id/history - User:', req.user, 'ID:', req.params.id);
  getCustomerHistory(req, res);
});

router.post('/', authenticateToken, isAdmin, (req, res) => {
  console.log('POST /api/customers - User:', req.user, 'Body:', req.body);
  createCustomer(req, res);
});

router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('PUT /api/customers/:id - User:', req.user, 'Body:', req.body, 'ID:', req.params.id);
  updateCustomer(req, res);
});

router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('DELETE /api/customers/:id - User:', req.user, 'ID:', req.params.id);
  deleteCustomer(req, res);
});

module.exports = router;