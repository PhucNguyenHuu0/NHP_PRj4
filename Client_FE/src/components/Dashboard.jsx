import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ token, role }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('No token available. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
      return;
    }

    const endpoints = [
      { url: 'http://localhost:5000/api/products', key: 'totalProducts' },
      { url: 'http://localhost:5000/api/categories', key: 'totalCategories' },
      { url: 'http://localhost:5000/api/orders', key: 'totalOrders' },
      { url: 'http://localhost:5000/api/customers', key: 'totalCustomers' },
    ];

    try {
      const responses = await Promise.all(
        endpoints.map(({ url }) =>
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        )
      );
      const newStats = endpoints.reduce((acc, { key }, index) => {
        acc[key] = Array.isArray(responses[index].data) ? responses[index].data.length : responses[index].data.data?.length || 0;
        return acc;
      }, {});
      setStats(newStats);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token, navigate]);

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  if (role !== 'Admin') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome, Employee!</h1>
        <p className="text-center text-gray-700">You can view data but cannot modify it.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-700">Total Products</h2>
          <p className="text-3xl text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-700">Total Categories</h2>
          <p className="text-3xl text-blue-600">{stats.totalCategories}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-700">Total Orders</h2>
          <p className="text-3xl text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-700">Total Customers</h2>
          <p className="text-3xl text-blue-600">{stats.totalCustomers}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;