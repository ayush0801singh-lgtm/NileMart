import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../api/services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';

function VendorDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getVendorDashboard()
      .then((r) => setDashboard(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading vendor dashboard..." />;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-1">Vendor Dashboard</h2>
      <p className="text-muted mb-4">Hello, {user?.first_name}. Here's your store performance.</p>

      <div className="row">
        <div className="col-md-4"><StatCard title="Active Products" value={dashboard?.product_count || 0} icon="🛍️" colorClass="stat-primary" /></div>
        <div className="col-md-4"><StatCard title="Total Order Items" value={dashboard?.total_order_items || 0} icon="📦" colorClass="stat-info" /></div>
        <div className="col-md-4"><StatCard title="Total Revenue" value={`$${Number(dashboard?.total_revenue || 0).toFixed(2)}`} icon="💰" colorClass="stat-success" /></div>
      </div>

      <div className="row mt-2 mb-4">
        <div className="col-md-4 mb-2">
          <Link to="/vendor/products" className="btn btn-primary w-100">Manage Products</Link>
        </div>
        <div className="col-md-4 mb-2">
          <Link to="/vendor/orders" className="btn btn-outline-secondary w-100">View Orders</Link>
        </div>
      </div>

      <h5 className="fw-bold mb-3">Recent Orders</h5>
      {!dashboard?.recent_orders?.length ? (
        <div className="alert alert-light">No orders yet.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {dashboard.recent_orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_email}</td>
                    <td>${Number(order.total_price).toFixed(2)}</td>
                    <td><span className="badge bg-secondary">{order.status_display}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
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

export default VendorDashboard;