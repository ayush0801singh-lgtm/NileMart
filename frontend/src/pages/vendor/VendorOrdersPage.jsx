import React, { useState, useEffect } from 'react';
import orderService from '../../api/services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_BADGE = {
  PENDING: 'bg-secondary', CONFIRMED: 'bg-info', PROCESSING: 'bg-warning text-dark',
  SHIPPED: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger',
};

function VendorOrdersPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getVendorDashboard()
      .then((r) => setDashboard(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  const orders = dashboard?.recent_orders || [];

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <div className="alert alert-light">No orders have come in yet.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_email}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td>${Number(order.total_price).toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_BADGE[order.status] || 'bg-secondary'}`}>{order.status_display}</span></td>
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

export default VendorOrdersPage;