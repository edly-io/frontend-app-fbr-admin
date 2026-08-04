import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ status }) => {
  const active = status === 'Active';
  return (
    <span style={{
      background: active ? '#EDFAF1' : 'var(--pgn-color-gray-100)', color: active ? 'var(--pgn-color-green)' : 'var(--pgn-color-gray-base)', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '5px',
    }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%', background: active ? 'var(--pgn-color-green)' : 'var(--pgn-color-gray-400)', flexShrink: 0,
      }}
      />
      {status}
    </span>
  );
};

StatusBadge.propTypes = { status: PropTypes.string.isRequired };

export default StatusBadge;
