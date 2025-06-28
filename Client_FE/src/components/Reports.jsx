import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = ({ token }) => {
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Vui lòng đăng nhập để truy cập.');
      setLoading(false);
      return;
    }
    fetchSalesData();
  }, [token]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/reports/revenue', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
      });
      setSalesData(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError('Không thể tải dữ liệu báo cáo.');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchSalesData();
  };

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 mb-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Báo Cáo Doanh Thu</h1>
      <div className="mb-6">
        <form onSubmit={handleFilter} className="bg-white p-4 rounded-lg shadow-md flex space-x-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Từ Ngày</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="border p-2 rounded focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Đến Ngày</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="border p-2 rounded focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={loading}
          >
            Lọc
          </button>
        </form>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Danh Sách Doanh Thu</h2>
        {salesData.length === 0 ? (
          <p className="text-gray-600 text-center">Không có dữ liệu để hiển thị.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Ngày</th>
                <th className="border px-4 py-2">Tổng Doanh Thu (VND)</th>
                <th className="border px-4 py-2">Số Đơn Hàng</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{sale.date}</td>
                  <td className="border px-4 py-2">{sale.total?.toLocaleString()}</td>
                  <td className="border px-4 py-2">{sale.nhp_order_count || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;