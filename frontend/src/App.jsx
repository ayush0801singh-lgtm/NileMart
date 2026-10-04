import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import ProductListPage from './pages/customer/ProductListPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import WalletPage from './pages/customer/WalletPage';
import MembershipPage from './pages/customer/MembershipPage';

import VendorDashboard from './pages/vendor/VendorDashboard';
import ProductManagePage from './pages/vendor/ProductManagePage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagePage from './pages/admin/UserManagePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'ADMIN']} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
            <Route path="/dashboard/vendor" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<ProductManagePage />} />
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </AuthProvider>
  );
}

export default App;