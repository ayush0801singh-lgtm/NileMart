import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out successfully.');
    navigate('/login');
  };

  const renderRoleLinks = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') {
      return (
        <>
          <Link className="nav-link" to="/dashboard/admin">Admin Dashboard</Link>
          <Link className="nav-link" to="/admin/users">Users</Link>
        </>
      );
    }
    if (user.role === 'VENDOR') {
      return (
        <>
          <Link className="nav-link" to="/dashboard/vendor">Vendor Dashboard</Link>
          <Link className="nav-link" to="/vendor/products">My Products</Link>
          <Link className="nav-link" to="/vendor/orders">Orders</Link>
        </>
      );
    }
    return (
      <>
        <Link className="nav-link" to="/dashboard/customer">My Account</Link>
        <Link className="nav-link" to="/cart">Cart</Link>
        <Link className="nav-link" to="/wallet">Wallet</Link>
        <Link className="nav-link" to="/membership">Prime</Link>
      </>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/products">NileMart</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarMain">
        <ul className="navbar-nav me-auto">
          <li className="nav-item"><Link className="nav-link" to="/products">Products</Link></li>
        </ul>
        <ul className="navbar-nav ms-auto align-items-center gap-1">
          {renderRoleLinks()}
          {user ? (
            <>
              <li className="nav-item">
                <span className="nav-link text-warning">{user.first_name}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
              <li className="nav-item"><Link className="btn btn-primary btn-sm" to="/register">Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;