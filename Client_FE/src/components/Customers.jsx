import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';

const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    nhp_name: '',
    nhp_email: '',
    nhp_phone: '',
    nhp_address: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(5);
  const [editCustomer, setEditCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError('Failed to fetch customers.');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createCustomer = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/customers', newCustomer, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers([...customers, response.data]);
      setNewCustomer({ nhp_name: '', nhp_email: '', nhp_phone: '', nhp_address: '' });
      setSuccess('Customer created successfully.');
    } catch (err) {
      setError('Failed to create customer.');
      console.error('Error creating customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id, updatedCustomer) => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/customers/${id}`, updatedCustomer, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(customers.map((c) => (c.nhp_id === id ? response.data : c)));
      setEditCustomer(null);
      setSuccess('Customer updated successfully.');
    } catch (err) {
      setError('Failed to update customer.');
      console.error('Error updating customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomers(customers.filter((c) => c.nhp_id !== id));
        setSuccess('Customer deleted successfully.');
      } catch (err) {
        setError('Failed to delete customer.');
        console.error('Error deleting customer:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const debouncedSearch = debounce((value) => setSearchTerm(value), 300);

  const filteredCustomers = customers.filter((customer) =>
    customer.nhp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Customers</h1>
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Add New Customer</h2>
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={newCustomer.nhp_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_name: e.target.value })}
            className="border p-2 rounded w-full"
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={newCustomer.nhp_email}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_email: e.target.value })}
            className="border p-2 rounded w-full"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Phone"
            value={newCustomer.nhp_phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_phone: e.target.value })}
            className="border p-2 rounded w-full"
            disabled={loading}
          />
          <textarea
            placeholder="Address"
            value={newCustomer.nhp_address}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_address: e.target.value })}
            className="border p-2 rounded w-full"
            disabled={loading}
          />
          <button
            onClick={createCustomer}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loading}
          >
            Add Customer
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentCustomers.map((customer) => (
          <div key={customer.nhp_id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-700">{customer.nhp_name}</h3>
            <p className="text-lg text-blue-600">Email: {customer.nhp_email}</p>
            <p className="text-sm text-gray-500">Phone: {customer.nhp_phone || 'N/A'}</p>
            <p className="text-sm text-gray-500">Address: {customer.nhp_address || 'N/A'}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditCustomer(customer)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-400"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={() => deleteCustomer(customer.nhp_id)}
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
      {editCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Customer</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={editCustomer.nhp_name}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_name: e.target.value })}
                className="border p-2 rounded w-full"
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={editCustomer.nhp_email}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_email: e.target.value })}
                className="border p-2 rounded w-full"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Phone"
                value={editCustomer.nhp_phone}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_phone: e.target.value })}
                className="border p-2 rounded w-full"
                disabled={loading}
              />
              <textarea
                placeholder="Address"
                value={editCustomer.nhp_address}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_address: e.target.value })}
                className="border p-2 rounded w-full"
                disabled={loading}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditCustomer(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCustomer(editCustomer.nhp_id, editCustomer)}
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

export default Customers;