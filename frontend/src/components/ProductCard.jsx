import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../api/services/orderService';
import { toast } from 'react-toastify';

function ProductCard({ product }) {
  const { user } = useAuth();

  const handleAddToCart = async () => {
    try {
      await orderService.addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error('Failed to add to cart. Please log in first.');
    }
  };

  const imageUrl = product.image || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="card h-100 product-card shadow-sm">
      <img
        src={imageUrl}
        className="card-img-top"
        alt={product.name}
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <span className="badge bg-secondary mb-1" style={{ width: 'fit-content' }}>
          {product.category_name || 'Uncategorized'}
        </span>
        <h6 className="card-title fw-bold">{product.name}</h6>
        <p className="text-muted small mb-1">by {product.vendor_name}</p>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-primary fs-5">${Number(product.price).toFixed(2)}</span>
            <span className={`badge ${product.stock_status === 'IN_STOCK' ? 'bg-success' : 'bg-danger'}`}>
              {product.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <div className="d-grid gap-2">
            <Link to={`/products/${product.id}`} className="btn btn-outline-secondary btn-sm">View Details</Link>
            {product.stock_status === 'IN_STOCK' && (
              <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>Add to Cart</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;