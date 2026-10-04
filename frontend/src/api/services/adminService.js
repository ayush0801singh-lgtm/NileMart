import axiosInstance from '../axiosInstance';

const adminService = {
  getUsers: (params = {}) => axiosInstance.get('/auth/admin/users/', { params }),
  updateUser: (id, data) => axiosInstance.patch(`/auth/admin/users/${id}/`, data),
  getAdminWallets: () => axiosInstance.get('/wallet/admin/wallets/'),
};

export default adminService;