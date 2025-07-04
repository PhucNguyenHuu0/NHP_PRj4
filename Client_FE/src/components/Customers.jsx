import React, { useState } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const Customers = ({ token, role }) => {
  const queryClient = useQueryClient();
  const [newCustomer, setNewCustomer] = useState({
    nhp_name: '',
    nhp_email: '',
    nhp_phone: '',
    nhp_address: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(5);
  const [editCustomer, setEditCustomer] = useState(null);

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response (Customers):', response.data);
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    },
    enabled: !!token,
    onError: (err) => console.error('Query error (Customers):', err.response?.data || err.message),
  });

  const createMutation = useMutation({
    mutationFn: (newCustomer) =>
      axios.post('http://localhost:5000/api/customers', newCustomer, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(['customers'], (old) => [...old, response.data]);
      setNewCustomer({ nhp_name: '', nhp_email: '', nhp_phone: '', nhp_address: '' });
      toast.success('Customer created successfully.');
    },
    onError: (err) => {
      toast.error('Failed to create customer.');
      console.error('Error creating customer:', err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedCustomer }) =>
      axios.put(`http://localhost:5000/api/customers/${id}`, updatedCustomer, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(['customers'], (old) =>
        old.map((c) => (c.nhp_id === response.data.nhp_id ? response.data : c))
      );
      setEditCustomer(null);
      toast.success('Customer updated successfully.');
    },
    onError: (err) => {
      toast.error('Failed to update customer.');
      console.error('Error updating customer:', err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axios.delete(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.setQueryData(['customers'], (old) => old.filter((c) => c.nhp_id !== deleteMutation.variables));
      toast.success('Customer deleted successfully.');
    },
    onError: (err) => {
      toast.error('Failed to delete customer.');
      console.error('Error deleting customer:', err);
    },
  });

  const debouncedSearch = debounce((value) => setSearchTerm(value), 300);

  const filteredCustomers = customers.filter((customer) =>
    customer.nhp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  if (isLoading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Customers</h1>
      {role === 'Admin' && (
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
              onClick={() => createMutation.mutate(newCustomer)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={createMutation.isLoading || !newCustomer.nhp_name}
            >
              Add Customer
            </button>
          </div>
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Customer List</h2>
        <input
          type="text"
          placeholder="Search by name..."
          onChange={(e) => debouncedSearch(e.target.value)}
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
            {role === 'Admin' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditCustomer(customer)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-400"
                  disabled={updateMutation.isLoading}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(customer.nhp_id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-red-400"
                  disabled={deleteMutation.isLoading}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
            disabled={isLoading}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || isLoading}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:bg-gray-200"
        >
          Next
        </button>
      </div>
      {editCustomer && role === 'Admin' && (
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
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateMutation.mutate({ id: editCustomer.nhp_id, updatedCustomer: editCustomer })}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={updateMutation.isLoading}
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