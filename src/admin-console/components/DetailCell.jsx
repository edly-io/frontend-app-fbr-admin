import React from 'react';
import PropTypes from 'prop-types';

const DetailCell = ({ label, value }) => {
  if (value === undefined || value === null || value === '') { return null; }
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{
        margin: 0, fontSize: '10.5px', fontWeight: 700, color: 'var(--pgn-color-gray-400)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px',
      }}
      >{label}
      </p>
      <p style={{
        margin: 0, fontSize: '14px', color: 'var(--pgn-color-gray-900)', wordBreak: 'break-word',
      }}
      >{value}
      </p>
    </div>
  );
};

DetailCell.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

DetailCell.defaultProps = {
  value: '',
};

export default DetailCell;
