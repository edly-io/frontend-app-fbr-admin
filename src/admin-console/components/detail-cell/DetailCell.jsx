import React from 'react';
import PropTypes from 'prop-types';
import './detail-cell-styles.scss';

const DetailCell = ({ label, value }) => {
  if (value === undefined || value === null || value === '') { return null; }
  return (
    <div className="detail-cell">
      <p className="detail-cell__label">{label}</p>
      <p className="detail-cell__value">{value}</p>
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
