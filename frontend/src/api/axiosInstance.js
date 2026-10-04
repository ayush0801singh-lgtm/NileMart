import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('nilemart_tokens');
    if (stored) {
      try {
        const { access } = JSON.parse(stored);
        config.headers.Authorization = `Bearer ${access}`;
      } catch {
        // ignore malformed token storage
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const stored = localStorage.getItem('nilemart_tokens');
      if (stored) {
        try {
          const { refresh } = JSON.parse(stored);
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          const updated = { ...JSON.parse(stored), access: data.access };
          localStorage.setItem('nilemart_tokens', JSON.stringify(updated));
          original.headers.Authorization = `Bearer ${data.access}`;
          return axiosInstance(original);
        } catch {
          localStorage.removeItem('nilemart_tokens');
          localStorage.removeItem('nilemart_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;