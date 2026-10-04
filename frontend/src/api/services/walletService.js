import axiosInstance from '../axiosInstance';

const walletService = {
  getMyWallet: () => axiosInstance.get('/wallet/my-wallet/'),
  getMyTransactions: () => axiosInstance.get('/wallet/my-transactions/'),
};

export default walletService;