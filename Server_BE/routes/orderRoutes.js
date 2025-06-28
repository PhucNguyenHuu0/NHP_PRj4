const express = require('express');
const {
  getOrders,
  getOrderDetails,
  createOrder,
  updateOrder,
} = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/orders - User:', req.user);
  getOrders(req, res);
});

router.get('/:id/details', authenticateToken, (req, res) => {
  console.log('GET /api/orders/:id/details - User:', req.user, 'ID:', req.params.id);
  getOrderDetails(req, res);
});

router.post('/', authenticateToken, isAdmin, (req, res) => {
  console.log('POST /api/orders - User:', req.user, 'Body:', req.body);
  createOrder(req, res);
});

router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('PUT /api/orders/:id - User:', req.user, 'Body:', req.body, 'ID:', req.params.id);
  updateOrder(req, res);
});

module.exports = router;