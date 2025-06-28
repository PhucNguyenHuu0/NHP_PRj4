import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Promotions = ({ token, role }) => {
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({ nhp_name: '', nhp_discount: 0 });
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Vui lòng đăng nhập để truy cập.');
      return;
    }
    fetchPromotions();
  }, [token]);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/promotions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(response.data);
    } catch (err) {
      setError('Không thể tải danh sách khuyến mãi.');
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (selectedPromotionId) {
        await axios.put(`http://localhost:5000/api/promotions/${selectedPromotionId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Cập nhật khuyến mãi thành công.');
      } else {
        await axios.post('http://localhost:5000/api/promotions', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Thêm khuyến mãi thành công.');
      }
      fetchPromotions();
      resetForm();
    } catch (err) {
      setError('Thao tác thất bại. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/promotions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Xóa khuyến mãi thành công.');
        fetchPromotions();
      } catch (err) {
        setError('Xóa khuyến mãi thất bại.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nhp_name: '', nhp_discount: 0 });
    setSelectedPromotionId(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Quản Lý Khuyến Mãi</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
      {role === 'Admin' && (
        <div className="mb-6">
          <form onSubmit={handleCreateOrUpdate} className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tên Khuyến Mãi</label>
              <input
                type="text"
                value={formData.nhp_name}
                onChange={(e) => setFormData({ ...formData, nhp_name: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Phần Trăm Giảm Giá (%)</label>
              <input
                type="number"
                value={formData.nhp_discount}
                onChange={(e) => setFormData({ ...formData, nhp_discount: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              {selectedPromotionId ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
            {selectedPromotionId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
            )}
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <div key={promo.nhp_id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{promo.nhp_name}</h3>
            <p className="text-gray-600">Giảm: {promo.nhp_discount}%</p>
            {role === 'Admin' && (
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => setFormData({ nhp_name: promo.nhp_name, nhp_discount: promo.nhp_discount }) || setSelectedPromotionId(promo.nhp_id)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(promo.nhp_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promotions;