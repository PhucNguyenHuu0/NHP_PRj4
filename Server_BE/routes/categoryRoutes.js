const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/categories - User:', req.user);
  getCategories(req, res);
});

router.post('/', authenticateToken, isAdmin, (req, res) => {
  console.log('POST /api/categories - User:', req.user, 'Body:', req.body);
  createCategory(req, res);
});

router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('PUT /api/categories/:id - User:', req.user, 'Body:', req.body, 'ID:', req.params.id);
  updateCategory(req, res);
});

router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('DELETE /api/categories/:id - User:', req.user, 'ID:', req.params.id);
  deleteCategory(req, res);
});

module.exports = router;