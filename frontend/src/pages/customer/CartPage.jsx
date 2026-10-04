import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import orderService from '../../api/services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await orderService.getCart();
      setCart(res.data);
    } catch {
      toast.error('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      await orderService.removeCartItem(itemId);
      toast.success('Item removed.');
      fetchCart();
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await orderService.updateCartItem(itemId, quantity);
      fetchCart();
    } catch {
      toast.error('Failed to update quantity.');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear the entire cart?')) return;
    try {
      await orderService.clearCart();
      toast.success('Cart cleared.');
      fetchCart();
    } catch {
      toast.error('Failed to clear cart.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your cart..." />;

  const items = cart?.items || [];

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Shopping Cart</h2>
      {items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Your cart is empty.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="fw-semibold">{item.product_name}</td>
                        <td>${Number(item.unit_price).toFixed(2)}</td>
                        <td>
                          <div className="input-group" style={{ width: '110px' }}>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                            <span className="form-control form-control-sm text-center">{item.quantity}</span>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                        </td>
                        <td>${Number(item.subtotal).toFixed(2)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button className="btn btn-outline-secondary btn-sm mt-2" onClick={handleClearCart}>Clear Cart</button>
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold">Order Summary</h5>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({items.length} items)</span>
                  <strong>${Number(cart?.total || 0).toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Shipping</span>
                  <span className="text-success">Calculated at checkout</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Total</span>
                  <span>${Number(cart?.total || 0).toFixed(2)}</span>
                </div>
                <button className="btn btn-primary w-100" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;