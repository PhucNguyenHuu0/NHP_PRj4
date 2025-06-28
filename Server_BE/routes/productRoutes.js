const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductAttributes,
  createProductAttribute,
} = require('../controllers/productController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../utils/upload');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/products - User:', req.user);
  getProducts(req, res);
});

router.post('/', authenticateToken, isAdmin, upload.single('nhp_image'), (req, res) => {
  console.log('POST /api/products - User:', req.user, 'File:', req.file);
  createProduct(req, res);
});

router.put('/:id', authenticateToken, isAdmin, upload.single('nhp_image'), (req, res) => {
  console.log('PUT /api/products/:id - User:', req.user, 'File:', req.file, 'ID:', req.params.id);
  updateProduct(req, res);
});

router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  console.log('DELETE /api/products/:id - User:', req.user, 'ID:', req.params.id);
  deleteProduct(req, res);
});

router.get('/:productId/attributes', authenticateToken, (req, res) => {
  console.log('GET /api/products/:productId/attributes - User:', req.user, 'ProductID:', req.params.productId);
  getProductAttributes(req, res);
});

router.post('/attributes', authenticateToken, isAdmin, (req, res) => {
  console.log('POST /api/products/attributes - User:', req.user, 'Body:', req.body);
  createProductAttribute(req, res);
});

module.exports = router;