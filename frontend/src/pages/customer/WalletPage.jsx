import React, { useState, useEffect } from 'react';
import walletService from '../../api/services/walletService';
import LoadingSpinner from '../../components/LoadingSpinner';

function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletService.getMyWallet()
      .then((r) => setWallet(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading wallet..." />;

  const TX_COLORS = {
    REFERRAL_COMMISSION: 'text-success',
    WITHDRAWAL: 'text-danger',
    PURCHASE: 'text-danger',
    REFUND: 'text-success',
    BONUS: 'text-success',
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">My Wallet</h2>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow">
            <div className="card-body text-center py-4">
              <h6 className="card-subtitle mb-2 opacity-75">Available Balance</h6>
              <h2 className="card-title fw-bold display-5">${Number(wallet?.balance || 0).toFixed(2)}</h2>
            </div>
          </div>
        </div>
      </div>

      <h5 className="fw-bold mb-3">Transaction History</h5>
      {wallet?.transactions?.length === 0 ? (
        <div className="alert alert-light">No transactions yet. Earn commissions by referring friends!</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Date</th><th>Type</th><th>Description</th><th className="text-end">Amount</th></tr>
              </thead>
              <tbody>
                {wallet?.transactions?.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td><span className="badge bg-light text-dark border">{tx.transaction_type.replace('_', ' ')}</span></td>
                    <td className="text-muted small">{tx.description}</td>
                    <td className={`text-end fw-bold ${TX_COLORS[tx.transaction_type] || ''}`}>
                      ${Number(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletPage;