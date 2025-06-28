import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ nhp_name: '' });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(5);
  const [editCategory, setEditCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories.');
      console.error('Error fetching categories:', err);
    }
  };

  const createCategory = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/categories', newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ nhp_name: '' });
    } catch (err) {
      setError('Failed to create category.');
      console.error('Error creating category:', err);
    }
  };

  const updateCategory = async (id, updatedCategory) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/categories/${id}`, updatedCategory);
      setCategories(categories.map((c) => (c.nhp_id === id ? response.data : c)));
      setEditCategory(null);
    } catch (err) {
      setError('Failed to update category.');
      console.error('Error updating category:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      setCategories(categories.filter((c) => c.nhp_id !== id));
    } catch (err) {
      setError('Failed to delete category.');
      console.error('Error deleting category:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lọc danh mục theo từ khóa tìm kiếm
  const filteredCategories = categories.filter((category) =>
    category.nhp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Phân trang
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Categories</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Add New Category</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.nhp_name}
            onChange={(e) => setNewCategory({ ...newCategory, nhp_name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={createCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Category
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCategories.map((category) => (
          <div key={category.nhp_id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-700">{category.nhp_name}</h3>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditCategory(category)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(category.nhp_id)}
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
      {editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Category</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Category Name"
                value={editCategory.nhp_name}
                onChange={(e) => setEditCategory({ ...editCategory, nhp_name: e.target.value })}
                className="border p-2 rounded w-full"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditCategory(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCategory(editCategory.nhp_id, editCategory)}
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

export default Categories;