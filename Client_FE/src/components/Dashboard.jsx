import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ token, role }) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi tuần tự với delay để tránh lỗi 429
      const customersResp = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: `Bearer ${token}` } });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s
      const ordersResp = await axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s
      const categoriesResp = await axios.get('http://localhost:5000/api/categories', { headers: { Authorization: `Bearer ${token}` } });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s
      const productsResp = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${token}` } });

      setStats({
        totalCustomers: Array.isArray(customersResp.data) ? customersResp.data.length : customersResp.data.data?.length || 0,
        totalOrders: Array.isArray(ordersResp.data) ? ordersResp.data.length : ordersResp.data.data?.length || 0,
        totalCategories: Array.isArray(categoriesResp.data) ? categoriesResp.data.length : categoriesResp.data.data?.length || 0,
        totalProducts: Array.isArray(productsResp.data) ? productsResp.data.length : productsResp.data.data?.length || 0,
      });
    } catch (err) {
      setError('Failed to fetch dashboard stats. Please try again later or contact support.');
      console.error('Error fetching stats:', err.response?.status, err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Employee Dashboard</h1>
      <p className="text-center mb-4">Welcome, {role === 'Admin' ? 'Admin' : 'Employee'}!</p>
      <p className="text-center mb-6">{role === 'Admin' ? 'You can view and modify data.' : 'You can view data but cannot modify it.'}</p>
      {loading && <div className="text-center mb-4">Đang tải dữ liệu...</div>}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded text-center">
            <h2 className="text-xl font-semibold">Total Customers</h2>
            <p className="text-2xl">{stats.totalCustomers}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded text-center">
            <h2 className="text-xl font-semibold">Total Orders</h2>
            <p className="text-2xl">{stats.totalOrders}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded text-center">
            <h2 className="text-xl font-semibold">Total Categories</h2>
            <p className="text-2xl">{stats.totalCategories}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded text-center">
            <h2 className="text-xl font-semibold">Total Products</h2>
            <p className="text-2xl">{stats.totalProducts}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/customers" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">View Customers</Link>
        <Link to="/reports" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">View Reports</Link>
        {role === 'Admin' && (
          <>
            <Link to="/inventory" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Manage Inventory</Link>
            <Link to="/categories" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Manage Categories</Link>
            <Link to="/products" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Manage Products</Link>
            <Link to="/orders" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Manage Orders</Link>
            <Link to="/promotions" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Manage Promotions</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;