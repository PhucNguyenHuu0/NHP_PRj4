import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    nhp_name: '',
    nhp_email: '',
    nhp_phone: '',
    nhp_address: '',
  });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(5);
  const [editCustomer, setEditCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to fetch customers.');
      console.error('Error fetching customers:', err);
    }
  };

  const createCustomer = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/customers', newCustomer);
      setCustomers([...customers, response.data]);
      setNewCustomer({ nhp_name: '', nhp_email: '', nhp_phone: '', nhp_address: '' });
    } catch (err) {
      setError('Failed to create customer.');
      console.error('Error creating customer:', err);
    }
  };

  const updateCustomer = async (id, updatedCustomer) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/customers/${id}`, updatedCustomer);
      setCustomers(customers.map((c) => (c.nhp_id === id ? response.data : c)));
      setEditCustomer(null);
    } catch (err) {
      setError('Failed to update customer.');
      console.error('Error updating customer:', err);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      setCustomers(customers.filter((c) => c.nhp_id !== id));
    } catch (err) {
      setError('Failed to delete customer.');
      console.error('Error deleting customer:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lọc khách hàng theo tên
  const filteredCustomers = customers.filter((customer) =>
    customer.nhp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Phân trang
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Customers</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Add New Customer</h2>
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={newCustomer.nhp_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={newCustomer.nhp_email}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_email: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Phone"
            value={newCustomer.nhp_phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_phone: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <textarea
            placeholder="Address"
            value={newCustomer.nhp_address}
            onChange={(e) => setNewCustomer({ ...newCustomer, nhp_address: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={createCustomer}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Customer
          </button>
        </div>
        {/* Thanh tìm kiếm */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full mb-4"
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
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCustomer(customer.nhp_id)}
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
              />
              <input
                type="email"
                placeholder="Email"
                value={editCustomer.nhp_email}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_email: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Phone"
                value={editCustomer.nhp_phone}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_phone: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <textarea
                placeholder="Address"
                value={editCustomer.nhp_address}
                onChange={(e) => setEditCustomer({ ...editCustomer, nhp_address: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditCustomer(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCustomer(editCustomer.nhp_id, editCustomer)}
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

export default Customers;