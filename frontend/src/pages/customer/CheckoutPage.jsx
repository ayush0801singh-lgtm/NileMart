import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../api/services/orderService';
import { toast } from 'react-toastify';

function CheckoutPage() {
  const [formData, setFormData] = useState({ shipping_address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shipping_address.trim() || formData.shipping_address.trim().length < 10) {
      setErrors({ shipping_address: 'Please enter a complete shipping address (at least 10 characters).' });
      return;
    }

    setLoading(true);
    try {
      const res = await orderService.checkout(formData);
      toast.success(`Order #${res.data.id} placed successfully!`);
      navigate('/dashboard/customer');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Checkout failed. Please try again.';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <h2 className="fw-bold mb-4">Checkout</h2>
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Shipping Address *</label>
                  <textarea
                    name="shipping_address"
                    className={`form-control ${errors.shipping_address ? 'is-invalid' : ''}`}
                    rows={4}
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="Enter your full shipping address including city, state, and postal code"
                  />
                  {errors.shipping_address && <div className="invalid-feedback">{errors.shipping_address}</div>}
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Order Notes <span className="text-muted">(optional)</span></label>
                  <textarea
                    name="notes" className="form-control" rows={3}
                    value={formData.notes} onChange={handleChange}
                    placeholder="Special delivery instructions or notes for the vendor"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Placing Order...</> : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;