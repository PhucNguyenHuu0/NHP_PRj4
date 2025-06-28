import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ auth, setAuth }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ token: '', role: '', name: '', email: '' });
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/products" className="hover:underline">Products</Link>
          <Link to="/categories" className="hover:underline">Categories</Link>
          <Link to="/orders" className="hover:underline">Orders</Link>
          <Link to="/customers" className="hover:underline">Customers</Link>
          <Link to="/promotions" className="hover:underline">Promotions</Link>
          <Link to="/inventory" className="hover:underline">Inventory</Link>
          <Link to="/reports" className="hover:underline">Reports</Link>
        </div>
        {auth.token && (
          <div className="space-x-4">
            <span>Welcome, {auth.name}</span>
            <button onClick={handleLogout} className="bg-red-500 px-2 py-1 rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;