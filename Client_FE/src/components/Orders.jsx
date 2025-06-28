import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [editOrder, setEditOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError('Failed to fetch orders.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateOrder = async (id, updatedOrder) => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${id}`, updatedOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.map((o) => (o.nhp_id === id ? response.data : o)));
      setEditOrder(null);
      setSuccess('Order updated successfully.');
    } catch (err) {
      setError('Failed to update order.');
      console.error('Error updating order:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(orders.filter((o) => o.nhp_id !== id));
        setSuccess('Order deleted successfully.');
      } catch (err) {
        setError('Failed to delete order.');
        console.error('Error deleting order:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const debouncedSearch = debounce((value) => setSearchTerm(value), 300);

  const filteredOrders = orders.filter((order) =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Orders</h1>
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}
      <input
        type="text"
        placeholder="Search by customer name..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        disabled={loading}
      />
      <div className="grid grid-cols-1 gap-4">
        {currentOrders.map((order) => (
          <div key={order.nhp_id} className="bg-white shadow-md rounded-lg p-4">
            <p className="text-lg text-gray-700">Order ID: {order.nhp_id}</p>
            <p className="text-lg text-blue-600">Customer: {order.customer_name}</p>
            <p className="text-lg text-blue-600">Total: {order.nhp_totalPrice} VND</p>
            <p className="text-sm text-gray-500">Status: {order.nhp_status}</p>
            <p className="text-sm text-gray-500">Date: {new Date(order.nhp_createdAt).toLocaleDateString()}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditOrder(order)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-400"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={() => deleteOrder(order.nhp_id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-red-400"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
            disabled={loading}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Next
        </button>
      </div>
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Order</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Status"
                value={editOrder.nhp_status}
                onChange={(e) => setEditOrder({ ...editOrder, nhp_status: e.target.value })}
                className="border p-2 rounded w-full"
                disabled={loading}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditOrder(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateOrder(editOrder.nhp_id, editOrder)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={loading}
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