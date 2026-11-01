import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, tone = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-content">
        <span className="stat-card-label">{title}</span>
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <span className="stat-card-sub">{subtitle}</span>}
      </div>
      {Icon && (
        <div className={`stat-card-icon stat-icon-${tone}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

