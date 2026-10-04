import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../api/services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';

function CustomerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getCustomerDashboard()
      .then((r) => setDashboard(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  const STATUS_BADGE = {
    PENDING: 'bg-secondary', CONFIRMED: 'bg-info', PROCESSING: 'bg-warning text-dark',
    SHIPPED: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger',
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-1">Welcome back, {user?.first_name}!</h2>
      <p className="text-muted mb-4">Here's your account overview.</p>

      <div className="row">
        <div className="col-md-3"><StatCard title="Total Orders" value={dashboard?.total_orders || 0} icon="📦" colorClass="stat-primary" /></div>
        <div className="col-md-3"><StatCard title="Total Spent" value={`$${Number(dashboard?.total_spent || 0).toFixed(2)}`} icon="💳" colorClass="stat-success" /></div>
        <div className="col-md-3"><StatCard title="Wallet Balance" value={`$${Number(dashboard?.wallet_balance || 0).toFixed(2)}`} icon="👛" colorClass="stat-warning" /></div>
        <div className="col-md-3">
          <StatCard
            title="Prime Status"
            value={dashboard?.membership?.is_active ? dashboard.membership.tier : 'None'}
            icon="⭐"
            colorClass="stat-info"
          />
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 mb-3">
          <Link to="/products" className="btn btn-primary w-100">Browse Products</Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/wallet" className="btn btn-outline-secondary w-100">View Wallet</Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/membership" className="btn btn-outline-warning w-100">Manage Prime</Link>
        </div>
      </div>

      <h5 className="fw-bold mt-3 mb-3">Recent Orders</h5>
      {dashboard?.recent_orders?.length === 0 ? (
        <div className="alert alert-light">You haven't placed any orders yet.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {dashboard?.recent_orders?.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>${Number(order.total_price).toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_BADGE[order.status] || 'bg-secondary'}`}>{order.status_display}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;