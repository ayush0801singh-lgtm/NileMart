import axiosInstance from '../axiosInstance';

const membershipService = {
  getTiers: () => axiosInstance.get('/membership/tiers/'),
  getStatus: () => axiosInstance.get('/membership/status/'),
  subscribe: (tier, months) => axiosInstance.post('/membership/subscribe/', { tier, months }),
  cancel: () => axiosInstance.post('/membership/cancel/'),
};

export default membershipService;