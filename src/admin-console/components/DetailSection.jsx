import React from 'react';
import PropTypes from 'prop-types';

const DetailSection = ({ title, children }) => (
  <div style={{ borderTop: '1px solid var(--pgn-color-gray-100)', padding: '18px 28px 22px' }}>
    <p style={{
      margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#2A6496', letterSpacing: '0.08em',
    }}
    >{title}
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 24px' }}>
      {children}
    </div>
  </div>
);

DetailSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default DetailSection;
