import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = ({ token, role }) => {
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({
    nhp_productId: '',
    nhp_attributeId: '',
    nhp_quantity: '',
  });
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchProducts();
  }, [token]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (err) {
      setError('Failed to fetch inventory logs');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const fetchAttributes = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}/attributes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttributes(response.data);
    } catch (err) {
      setError('Failed to fetch attributes');
    }
  };

  const handleImportInventory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inventory/import', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Inventory imported successfully');
      fetchLogs();
      setFormData({ nhp_productId: '', nhp_attributeId: '', nhp_quantity: '' });
    } catch (err) {
      setError('Failed to import inventory');
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.nhp_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {role === 'Admin' && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2 mb-4"
          />
          <form onSubmit={handleImportInventory} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Import Inventory</h2>
            <select
              value={formData.nhp_productId}
              onChange={(e) => {
                setFormData({ ...formData, nhp_productId: e.target.value });
                fetchAttributes(e.target.value);
              }}
              className="border p-2 rounded w-full mb-2"
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.nhp_id} value={product.nhp_id}>{product.nhp_name}</option>
              ))}
            </select>
            <select
              value={formData.nhp_attributeId}
              onChange={(e) => setFormData({ ...formData, nhp_attributeId: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              required
            >
              <option value="">Select Attribute</option>
              {attributes.map((attr) => (
                <option key={attr.nhp_id} value={attr.nhp_id}>{attr.nhp_size} - {attr.nhp_color}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={formData.nhp_quantity}
              onChange={(e) => setFormData({ ...formData, nhp_quantity: e.target.value })}
              className="border p-2 rounded w-full mb-2"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Import
            </button>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLogs.map((log) => (
          <div key={log.nhp_id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">Log #{log.nhp_id}</h3>
            <p>Type: {log.nhp_type}</p>
            <p>Quantity: {log.nhp_quantity}</p>
            <p>Date: {new Date(log.nhp_createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;