import axiosInstance from '../axiosInstance';

const authService = {
  register: (data) => axiosInstance.post('/auth/register/', data),
  login: (email, password) => axiosInstance.post('/auth/login/', { email, password }),
  logout: (refresh) => axiosInstance.post('/auth/logout/', { refresh }),
  getProfile: () => axiosInstance.get('/auth/profile/'),
  updateProfile: (data) => axiosInstance.patch('/auth/profile/', data),
};

export default authService;