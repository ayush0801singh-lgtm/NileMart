import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../api/services/productService';
import orderService from '../../api/services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    productService.getProductDetail(id)
      .then((r) => setProduct(r.data))
      .catch(() => toast.error('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await orderService.addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch {
      toast.error('Please log in to add items to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading product details..." />;
  if (!product) return <div className="container mt-5"><div className="alert alert-warning">Product not found.</div></div>;

  const imageUrl = product.image || 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="container py-5">
      <button className="btn btn-link text-decoration-none mb-3 ps-0" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="row g-4">
        <div className="col-md-5">
          <img src={imageUrl} alt={product.name} className="img-fluid rounded shadow" style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }} />
        </div>
        <div className="col-md-7">
          {product.category_name && <span className="badge bg-secondary mb-2">{product.category_name}</span>}
          <h2 className="fw-bold">{product.name}</h2>
          <p className="text-muted">Sold by <strong>{product.vendor_name}</strong></p>
          <h3 className="text-primary fw-bold">${Number(product.price).toFixed(2)}</h3>
          <p className="mt-3">{product.description}</p>
          <div className="d-flex align-items-center gap-3 mt-4">
            <div className="input-group" style={{ width: '130px' }}>
              <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" className="form-control text-center" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
              <button className="btn btn-outline-secondary" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button
              className="btn btn-primary btn-lg flex-grow-1"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock_status !== 'IN_STOCK'}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
          {product.stock_status !== 'IN_STOCK' && (
            <div className="alert alert-danger mt-3">This product is currently out of stock.</div>
          )}
          <div className="mt-4">
            <small className="text-muted">Stock: {product.stock_quantity} units available</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;