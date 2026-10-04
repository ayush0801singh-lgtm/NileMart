import axiosInstance from '../axiosInstance';

const productService = {
  getCategories: () => axiosInstance.get('/products/categories/'),
  getProducts: (params = {}) => axiosInstance.get('/products/', { params }),
  getProductDetail: (id) => axiosInstance.get(`/products/${id}/`),

  getMyProducts: () => axiosInstance.get('/products/vendor/my-products/'),
  createProduct: (data) => axiosInstance.post('/products/vendor/my-products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, data) => axiosInstance.patch(`/products/vendor/my-products/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => axiosInstance.delete(`/products/vendor/my-products/${id}/`),
};

export default productService;