import React from 'react';

function StatCard({ title, value, icon, colorClass = 'stat-primary', prefix = '', suffix = '' }) {
  return (
    <div className={`card dashboard-stat-card ${colorClass} mb-4 shadow-sm`}>
      <div className="card-body d-flex align-items-center gap-3">
        <div className="display-5 text-secondary">{icon}</div>
        <div>
          <div className="text-muted small text-uppercase fw-semibold">{title}</div>
          <div className="fw-bold fs-3">{prefix}{value}{suffix}</div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;