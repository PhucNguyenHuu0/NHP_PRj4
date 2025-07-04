import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = ({ token, role }) => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Vui lòng đăng nhập để truy cập.');
      setLoading(false);
      return;
    }
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError('Không thể tải danh sách hàng tồn kho.');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId) => {
    if (role !== 'Admin') {
      setError('Bạn không có quyền cập nhật số lượng.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/inventory/import',
        { nhp_productId: productId, nhp_attributeId: null, nhp_quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cập nhật số lượng thành công.');
      fetchInventory();
      setEditItem(null);
      setQuantity(0);
    } catch (err) {
      setError('Cập nhật số lượng thất bại.');
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 mb-4 text-center">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Quản Lý Hàng Tồn Kho</h1>
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <div key={item.nhp_id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{item.nhp_name || 'Unnamed Product'}</h3>
            <p className="text-gray-600">Số lượng: {item.nhp_quantity || 0}</p>
            {role === 'Admin' && (
              <div className="mt-2">
                {editItem === item.nhp_id ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="border p-1 rounded w-20"
                      min="0"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleUpdateQuantity(item.nhp_id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-green-400"
                      disabled={loading || !quantity}
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setEditItem(null);
                        setQuantity(0);
                      }}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:bg-gray-400"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditItem(item.nhp_id);
                      setQuantity(item.nhp_quantity || 0);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 disabled:bg-yellow-400"
                    disabled={loading}
                  >
                    Chỉnh Sửa
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;