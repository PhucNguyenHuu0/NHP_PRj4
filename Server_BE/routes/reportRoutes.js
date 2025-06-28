const express = require('express');
const {
  getRevenue,
  getTopProducts,
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/revenue', authenticateToken, (req, res) => {
  console.log('GET /api/reports/revenue - User:', req.user, 'Query:', req.query);
  getRevenue(req, res);
});

router.get('/top-products', authenticateToken, (req, res) => {
  console.log('GET /api/reports/top-products - User:', req.user);
  getTopProducts(req, res);
});

module.exports = router;