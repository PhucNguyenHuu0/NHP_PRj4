const express = require('express');
const {
  getInventoryLogs,
  importInventory,
} = require('../controllers/inventoryController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/inventory - User:', req.user);
  getInventoryLogs(req, res);
});

router.post('/import', authenticateToken, isAdmin, (req, res) => {
  console.log('POST /api/inventory/import - User:', req.user, 'Body:', req.body);
  importInventory(req, res);
});

module.exports = router;