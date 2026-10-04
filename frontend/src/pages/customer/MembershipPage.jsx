import React, { useState, useEffect } from 'react';
import membershipService from '../../api/services/membershipService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

function MembershipPage() {
  const [tiers, setTiers] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tiersRes, statusRes] = await Promise.allSettled([
        membershipService.getTiers(),
        membershipService.getStatus(),
      ]);
      if (tiersRes.status === 'fulfilled') setTiers(tiersRes.value.data);
      if (statusRes.status === 'fulfilled') setMembership(statusRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubscribe = async (tier) => {
    setSubscribing(tier);
    try {
      await membershipService.subscribe(tier, 1);
      toast.success(`Subscribed to ${tier} membership!`);
      fetchData();
    } catch {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setSubscribing('');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your membership?')) return;
    try {
      await membershipService.cancel();
      toast.info('Membership cancelled.');
      fetchData();
    } catch {
      toast.error('Failed to cancel membership.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading membership plans..." />;

  const TIER_COLORS = { SILVER: 'secondary', GOLD: 'warning', PLATINUM: 'info' };
  const TIER_ICONS = { SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎' };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-2">Prime Membership</h2>
      <p className="text-muted mb-4">Unlock exclusive benefits with a NileMart Prime membership.</p>

      {membership?.is_active && (
        <div className="alert alert-success d-flex justify-content-between align-items-center mb-4">
          <div>
            <strong>Active: {membership.tier} Plan</strong>
            <span className="ms-3 text-muted small">Expires: {new Date(membership.end_date).toLocaleDateString()}</span>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={handleCancel}>Cancel</button>
        </div>
      )}

      <div className="row g-4">
        {tiers.map((tier) => {
          const color = TIER_COLORS[tier.tier] || 'primary';
          const icon = TIER_ICONS[tier.tier] || '⭐';
          const isCurrent = membership?.tier === tier.tier && membership?.is_active;
          return (
            <div className="col-md-4" key={tier.tier}>
              <div className={`card h-100 shadow-sm ${isCurrent ? `border-${color} border-2` : ''}`}>
                <div className={`card-header bg-${color} ${color === 'warning' ? 'text-dark' : 'text-white'} text-center py-3`}>
                  <div className="fs-1">{icon}</div>
                  <h5 className="mb-0 fw-bold">{tier.tier}</h5>
                </div>
                <div className="card-body">
                  <h3 className="text-center fw-bold mb-3">${Number(tier.price).toFixed(2)}<small className="fs-6 fw-normal text-muted">/month</small></h3>
                  <ul className="list-unstyled">
                    <li className="mb-2">{tier.benefits?.free_shipping ? '✅' : '❌'} Free Shipping</li>
                    <li className="mb-2">🏷️ {tier.benefits?.discount_percentage}% Discount</li>
                    <li className="mb-2">{tier.benefits?.priority_support ? '✅' : '❌'} Priority Support</li>
                    <li className="mb-2">{tier.benefits?.early_access ? '✅' : '❌'} Early Access</li>
                  </ul>
                </div>
                <div className="card-footer bg-transparent">
                  <button
                    className={`btn btn-${color} w-100 ${color === 'warning' ? '' : 'text-white'}`}
                    onClick={() => handleSubscribe(tier.tier)}
                    disabled={subscribing === tier.tier || isCurrent}
                  >
                    {subscribing === tier.tier ? 'Subscribing...' : isCurrent ? 'Current Plan' : `Subscribe to ${tier.tier}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MembershipPage;