import React, { useState, useEffect } from 'react';
import productService from '../../api/services/productService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
  name: '', description: '', price: '', stock_quantity: '',
  category: '', stock_status: 'IN_STOCK', image: null,
};

function ProductManagePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await productService.getMyProducts();
      setProducts(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    productService.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category || '',
      stock_status: product.stock_status,
      image: null,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== '') data.append(k, v); });
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);
        toast.success('Product updated successfully.');
      } else {
        await productService.createProduct(data);
        toast.success('Product created successfully.');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Operation failed.';
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted.');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your products..." />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Products</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Add Product</button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">You haven't listed any products yet.</p>
          <button className="btn btn-primary" onClick={openCreateModal}>Add Your First Product</button>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock_quantity}</td>
                    <td><span className={`badge ${p.stock_status === 'IN_STOCK' ? 'bg-success' : 'bg-danger'}`}>{p.stock_status}</span></td>
                    <td><span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Product Name *</label>
                      <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea name="description" className="form-control" rows={3} value={formData.description} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Price ($) *</label>
                      <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} step="0.01" min="0.01" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Stock Quantity *</label>
                      <input type="number" name="stock_quantity" className="form-control" value={formData.stock_quantity} onChange={handleChange} min="0" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                        <option value="">-- Select Category --</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Stock Status</label>
                      <select name="stock_status" className="form-select" value={formData.stock_status} onChange={handleChange}>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISCONTINUED">Discontinued</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Product Image</label>
                      <input type="file" name="image" className="form-control" onChange={handleChange} accept="image/*" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagePage;