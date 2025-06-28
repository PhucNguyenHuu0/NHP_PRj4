import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Customers from './components/Customers';
import Categories from './components/Categories';
import Products from './components/Products';
import Orders from './components/Orders';
import Promotions from './components/Promotions';
import Reports from './components/Reports';
import Inventory from './components/Inventory';

const App = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    name: localStorage.getItem('name') || null,
    email: localStorage.getItem('email') || null,
  });

  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.Authorization = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.Authorization;
    }
  }, [auth.token]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!auth.token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(auth.role)) return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard token={auth.token} role={auth.role} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Customers token={auth.token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Categories token={auth.token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Products token={auth.token} role={auth.role} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Orders token={auth.token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Promotions token={auth.token} role={auth.role} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports token={auth.token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Inventory token={auth.token} role={auth.role} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;