import axiosInstance from '../axiosInstance';

const orderService = {
  getCart: () => axiosInstance.get('/orders/cart/'),
  addToCart: (productId, quantity) => axiosInstance.post('/orders/cart/', { product_id: productId, quantity }),
  clearCart: () => axiosInstance.delete('/orders/cart/'),
  updateCartItem: (itemId, quantity) => axiosInstance.patch(`/orders/cart/items/${itemId}/`, { quantity }),
  removeCartItem: (itemId) => axiosInstance.delete(`/orders/cart/items/${itemId}/`),

  checkout: (data) => axiosInstance.post('/orders/checkout/', data),

  getMyOrders: () => axiosInstance.get('/orders/my-orders/'),
  getOrderDetail: (id) => axiosInstance.get(`/orders/my-orders/${id}/`),

  getCustomerDashboard: () => axiosInstance.get('/orders/dashboard/customer/'),
  getVendorDashboard: () => axiosInstance.get('/orders/dashboard/vendor/'),
  getAdminDashboard: () => axiosInstance.get('/orders/dashboard/admin/'),

  getAdminOrders: () => axiosInstance.get('/orders/admin/orders/'),
  updateOrderStatus: (id, status) => axiosInstance.patch(`/orders/admin/orders/${id}/`, { status }),
};

export default orderService;