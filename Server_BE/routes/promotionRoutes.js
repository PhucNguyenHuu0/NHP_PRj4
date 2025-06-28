const express = require('express');
const {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require('../controllers/promotionController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/promotions - User:', req.user);
  getPromotions(req, res);
});

router.post('/', authenticateToken, isAdmin, (req, res) => {
  console.log('POST /api/promotions - User:', req.user, 'Body:', req.body);
  createPromotion(req, res);
});

router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('PUT /api/promotions/:id - User:', req.user, 'Body:', req.body, 'ID:', req.params.id);
  updatePromotion(req, res);
});

router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('DELETE /api/promotions/:id - User:', req.user, 'ID:', req.params.id);
  deletePromotion(req, res);
});

module.exports = router;