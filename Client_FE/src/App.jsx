import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import { queryClient } from './queryClient';
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

const AppContent = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    name: localStorage.getItem('name') || null,
    email: localStorage.getItem('email') || null,
  });
  const location = useLocation();

  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.Authorization = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.Authorization;
    }
  }, [auth.token]);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!auth.token) {
      if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
        return <Navigate to="/login" replace />;
      }
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(auth.role)) return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <ProtectedRoute>
            <Login setAuth={setAuth} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <ProtectedRoute>
            <ResetPassword />
          </ProtectedRoute>
        }
      />
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
          <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
            <Customers token={auth.token} role={auth.role} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Categories token={auth.token} role={auth.role} />
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
            <Orders token={auth.token} role={auth.role} />
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
          <ProtectedRoute allowedRoles={['Employee', 'Admin']}>
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
      <Route
        path="*"
        element={
          auth.token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <AppContent />
      </Router>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;