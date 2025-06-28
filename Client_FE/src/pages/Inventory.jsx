import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = ({ token, role }) => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (!token) {
      setError('Vui lòng đăng nhập để truy cập.');
      return;
    }
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
    } catch (err) {
      setError('Không thể tải danh sách hàng tồn kho.');
    }
  };

  const handleUpdateQuantity = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/inventory/${productId}`,
        { nhp_quantity: quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Cập nhật số lượng thành công.');
      fetchInventory();
      setEditItem(null);
      setQuantity(0);
    } catch (err) {
      setError('Cập nhật số lượng thất bại.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Quản Lý Hàng Tồn Kho</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <div key={item.nhp_id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{item.nhp_name}</h3>
            <p className="text-gray-600">Số lượng: {item.nhp_quantity}</p>
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
                    />
                    <button
                      onClick={() => handleUpdateQuantity(item.nhp_id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditItem(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditItem(item.nhp_id);
                      setQuantity(item.nhp_quantity);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
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