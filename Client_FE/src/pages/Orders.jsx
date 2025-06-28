import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [editOrder, setEditOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders.');
      console.error('Error fetching orders:', err);
    }
  };

  const updateOrder = async (id, updatedOrder) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${id}`, updatedOrder);
      setOrders(orders.map((o) => (o.nhp_id === id ? response.data : o)));
      setEditOrder(null);
    } catch (err) {
      setError('Failed to update order.');
      console.error('Error updating order:', err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`);
      setOrders(orders.filter((o) => o.nhp_id !== id));
    } catch (err) {
      setError('Failed to delete order.');
      console.error('Error deleting order:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc đơn hàng theo tên khách hàng
  const filteredOrders = orders.filter((order) =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Orders</h1>
      {/* Thanh tìm kiếm */}
      <input
        type="text"
        placeholder="Search by customer name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <div className="grid grid-cols-1 gap-4">
        {currentOrders.map((order) => (
          <div key={order.nhp_id} className="bg-white shadow-md rounded-lg p-4">
            <p className="text-lg text-gray-700">Order ID: {order.nhp_id}</p>
            <p className="text-lg text-blue-600">Customer: {order.customer_name}</p>
            <p className="text-lg text-blue-600">Product: {order.product_name}</p>
            <p className="text-lg text-blue-600">Quantity: {order.nhp_quantity}</p>
            <p className="text-lg text-blue-600">Total: {order.nhp_totalPrice} VND</p>
            <p className="text-sm text-gray-500">Status: {order.nhp_status}</p>
            <p className="text-sm text-gray-500">Date: {new Date(order.nhp_createdAt).toLocaleDateString()}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditOrder(order)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => deleteOrder(order.nhp_id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Điều hướng phân trang */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Next
        </button>
      </div>
      {/* Modal chỉnh sửa */}
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Order</h2>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Quantity"
                value={editOrder.nhp_quantity}
                onChange={(e) => setEditOrder({ ...editOrder, nhp_quantity: Number(e.target.value) })}
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                placeholder="Total Price"
                value={editOrder.nhp_totalPrice}
                onChange={(e) => setEditOrder({ ...editOrder, nhp_totalPrice: Number(e.target.value) })}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Status"
                value={editOrder.nhp_status}
                onChange={(e) => setEditOrder({ ...editOrder, nhp_status: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditOrder(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateOrder(editOrder.nhp_id, editOrder)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;