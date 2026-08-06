import React from 'react';
import PropTypes from 'prop-types';
import './status-badge-styles.scss';

const StatusBadge = ({ status }) => {
  const active = status === 'Active';
  return (
    <span className={`status-badge ${active ? 'status-badge--active' : ''}`}>
      <span className="status-badge__dot" />
      {status}
    </span>
  );
};

StatusBadge.propTypes = { status: PropTypes.string.isRequired };

export default StatusBadge;
