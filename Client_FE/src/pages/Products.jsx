import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products = ({ token, role }) => {
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [formData, setFormData] = useState({
    nhp_name: '',
    nhp_price: '',
    nhp_stock: '',
    nhp_description: '',
    nhp_categoryId: '',
    nhp_size: 'M',
    nhp_color: '',
    nhp_attributeStock: '',
  });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
    } else {
      setError('Please log in to access products.');
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please ensure you are logged in.');
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const fetchProductAttributes = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}/attributes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttributes((prev) => ({ ...prev, [productId]: response.data }));
    } catch (err) {
      setError('Failed to fetch attributes');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nhp_name', formData.nhp_name);
      formDataToSend.append('nhp_price', formData.nhp_price);
      formDataToSend.append('nhp_stock', formData.nhp_stock);
      formDataToSend.append('nhp_description', formData.nhp_description);
      formDataToSend.append('nhp_categoryId', formData.nhp_categoryId);
      if (e.target.nhp_image.files[0]) {
        formDataToSend.append('nhp_image', e.target.nhp_image.files[0]);
      }
      await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Product created successfully');
      fetchProducts();
      setFormData({ nhp_name: '', nhp_price: '', nhp_stock: '', nhp_description: '', nhp_categoryId: '' });
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nhp_name', formData.nhp_name);
      formDataToSend.append('nhp_price', formData.nhp_price);
      formDataToSend.append('nhp_stock', formData.nhp_stock);
      formDataToSend.append('nhp_description', formData.nhp_description);
      formDataToSend.append('nhp_categoryId', formData.nhp_categoryId);
      if (e.target.nhp_image.files[0]) {
        formDataToSend.append('nhp_image', e.target.nhp_image.files[0]);
      } else {
        formDataToSend.append('nhp_image', formData.nhp_image);
      }
      await axios.put(`http://localhost:5000/api/products/${selectedProductId}`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Product updated successfully');
      fetchProducts();
      setSelectedProductId(null);
      setFormData({ nhp_name: '', nhp_price: '', nhp_stock: '', nhp_description: '', nhp_categoryId: '' });
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products/attributes', {
        nhp_productId: selectedProductId,
        nhp_size: formData.nhp_size,
        nhp_color: formData.nhp_color,
        nhp_stock: formData.nhp_attributeStock,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Attribute created successfully');
      fetchProductAttributes(selectedProductId);
      setFormData({ ...formData, nhp_size: 'M', nhp_color: '', nhp_attributeStock: '' });
    } catch (err) {
      setError('Failed to create attribute');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.nhp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {role === 'Admin' && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2"
          />
          <form onSubmit={selectedProductId ? handleUpdateProduct : handleCreateProduct} className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{selectedProductId ? 'Edit Product' : 'Add Product'}</h2>
            <input
              type="text"
              placeholder="Product Name"
              value={formData.nhp_name}
              onChange={(e) => setFormData({ ...formData, nhp_name: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.nhp_price}
              onChange={(e) => setFormData({ ...formData, nhp_price: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={formData.nhp_stock}
              onChange={(e) => setFormData({ ...formData, nhp_stock: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.nhp_description}
              onChange={(e) => setFormData({ ...formData, nhp_description: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <select
              value={formData.nhp_categoryId}
              onChange={(e) => setFormData({ ...formData, nhp_categoryId: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.nhp_id} value={category.nhp_id}>{category.nhp_name}</option>
              ))}
            </select>
            <input
              type="file"
              name="nhp_image"
              onChange={(e) => setFormData({ ...formData, nhp_image: e.target.files[0] })}
              className="border p-2 rounded w-full mb-2"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {selectedProductId ? 'Update Product' : 'Add Product'}
            </button>
            {selectedProductId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProductId(null);
                  setFormData({ nhp_name: '', nhp_price: '', nhp_stock: '', nhp_description: '', nhp_categoryId: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2"
              >
                Cancel
              </button>
            )}
          </form>
          {selectedProductId && (
            <form onSubmit={handleCreateAttribute} className="mt-4 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Add Attribute</h2>
              <select
                value={formData.nhp_size}
                onChange={(e) => setFormData({ ...formData, nhp_size: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              <input
                type="text"
                placeholder="Color"
                value={formData.nhp_color}
                onChange={(e) => setFormData({ ...formData, nhp_color: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={formData.nhp_attributeStock}
                onChange={(e) => setFormData({ ...formData, nhp_attributeStock: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Attribute
              </button>
            </form>
          )}
        </div>
      )}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Product List</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.nhp_id} className="bg-white shadow-md rounded-lg p-4">
              <img
                src={product.nhp_image ? `http://localhost:5000/uploads/${product.nhp_image}` : 'https://via.placeholder.com/150'}
                alt={product.nhp_name}
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <h3 className="text-lg font-semibold">{product.nhp_name}</h3>
              <p>Price: {product.nhp_price} VND</p>
              <p>Stock: {product.nhp_stock}</p>
              <p>Category: {product.category_name}</p>
              {role === 'Admin' && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setSelectedProductId(product.nhp_id);
                      setFormData({
                        nhp_name: product.nhp_name,
                        nhp_price: product.nhp_price,
                        nhp_stock: product.nhp_stock,
                        nhp_description: product.nhp_description,
                        nhp_categoryId: product.nhp_categoryId,
                        nhp_image: product.nhp_image,
                      });
                      fetchProductAttributes(product.nhp_id);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.nhp_id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => fetchProductAttributes(product.nhp_id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 ml-2"
                  >
                    View Attributes
                  </button>
                </div>
              )}
              {attributes[product.nhp_id] && (
                <div className="mt-2">
                  <h4 className="text-md font-semibold">Attributes:</h4>
                  {attributes[product.nhp_id].map((attr) => (
                    <p key={attr.nhp_id} className="text-sm">
                      {attr.nhp_size} - {attr.nhp_color} (Stock: {attr.nhp_stock})
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;