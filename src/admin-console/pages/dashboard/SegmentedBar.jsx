import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composition bar exposed as a single image: individual segments cannot carry
 * their own value, so `label` has to name every one of them.
 */
const SegmentedBar = ({ segments, label, className }) => (
  <div className={`dashboard-segmented-bar ${className || ''}`} role="img" aria-label={label}>
    {segments.map(segment => (
      <span
        key={segment.id}
        className="dashboard-segmented-bar__segment"
        style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
      />
    ))}
  </div>
);

SegmentedBar.propTypes = {
  segments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
  })).isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default SegmentedBar;
