const db = require('../config/database');
const { logActivity } = require('../utils/logger');

const getProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, c.nhp_name as category_name 
      FROM nhp_products p 
      LEFT JOIN nhp_categories c ON p.nhp_categoryId = c.nhp_id
    `);
    console.log('Products fetched:', products);
    if (products.length === 0) {
      return res.status(200).json({ message: 'No products found', data: [] });
    }
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { nhp_name, nhp_price, nhp_stock, nhp_description, nhp_categoryId } = req.body;
    const nhp_image = req.file ? req.file.filename : null;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_products (nhp_name, nhp_price, nhp_stock, nhp_description, nhp_categoryId, nhp_image, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nhp_name, nhp_price, nhp_stock, nhp_description, nhp_categoryId, nhp_image, createdAt, updatedAt]
    );
    const [newProduct] = await db.query('SELECT * FROM nhp_products WHERE nhp_id = ?', [result.insertId]);
    await logActivity(req.user.id, 'CREATE_PRODUCT', `Created product ${nhp_name}`);
    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nhp_name, nhp_price, nhp_stock, nhp_description, nhp_categoryId } = req.body;
    const nhp_image = req.file ? req.file.filename : req.body.nhp_image;
    const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE nhp_products SET nhp_name = ?, nhp_price = ?, nhp_stock = ?, nhp_description = ?, nhp_categoryId = ?, nhp_image = ?, nhp_updatedAt = ? WHERE nhp_id = ?',
      [nhp_name, nhp_price, nhp_stock, nhp_description, nhp_categoryId, nhp_image, updatedAt, id]
    );
    const [updatedProduct] = await db.query('SELECT * FROM nhp_products WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'UPDATE_PRODUCT', `Updated product ${nhp_name}`);
    res.json(updatedProduct[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db.query('SELECT * FROM nhp_products WHERE nhp_id = ?', [id]);
    await db.query('DELETE FROM nhp_products WHERE nhp_id = ?', [id]);
    await logActivity(req.user.id, 'DELETE_PRODUCT', `Deleted product ${product[0].nhp_name}`);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(400).json({ error: 'Failed to delete product', details: err.message });
  }
};

const getProductAttributes = async (req, res) => {
  try {
    const { productId } = req.params;
    const [attributes] = await db.query('SELECT * FROM nhp_product_attributes WHERE nhp_productId = ?', [productId]);
    console.log('Product attributes fetched:', attributes);
    if (attributes.length === 0) {
      return res.status(200).json({ message: 'No attributes found', data: [] });
    }
    res.json(attributes);
  } catch (err) {
    console.error('Error fetching product attributes:', err);
    res.status(500).json({ error: 'Failed to fetch product attributes', details: err.message });
  }
};

const createProductAttribute = async (req, res) => {
  try {
    const { nhp_productId, nhp_size, nhp_color, nhp_stock } = req.body;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;
    const [result] = await db.query(
      'INSERT INTO nhp_product_attributes (nhp_productId, nhp_size, nhp_color, nhp_stock, nhp_createdAt, nhp_updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [nhp_productId, nhp_size, nhp_color, nhp_stock, createdAt, updatedAt]
    );
    const [newAttribute] = await db.query('SELECT * FROM nhp_product_attributes WHERE nhp_id = ?', [result.insertId]);
    await logActivity(req.user.id, 'CREATE_ATTRIBUTE', `Created attribute for product ${nhp_productId}`);
    res.status(201).json(newAttribute[0]);
  } catch (err) {
    console.error('Error creating product attribute:', err);
    res.status(400).json({ error: 'Failed to create product attribute', details: err.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductAttributes,
  createProductAttribute,
};