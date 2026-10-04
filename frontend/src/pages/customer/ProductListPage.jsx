import React, { useState, useEffect, useCallback } from 'react';
import productService from '../../api/services/productService';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await productService.getProducts(params);
      setProducts(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    productService.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="container py-4">
      <div className="row align-items-center mb-4">
        <div className="col">
          <h2 className="fw-bold mb-0">All Products</h2>
        </div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-7">
          <input
            type="text" className="form-control" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && <LoadingSpinner message="Loading products..." />}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted fs-5">No products found.</p>
        </div>
      )}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {products.map((product) => (
          <div className="col" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductListPage;