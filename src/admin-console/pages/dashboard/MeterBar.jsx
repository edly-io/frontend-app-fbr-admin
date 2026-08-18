import React from 'react';
import PropTypes from 'prop-types';

const clamp = percentage => Math.max(0, Math.min(100, percentage));

/**
 * Paragon's `ProgressBar` wraps Bootstrap's `.progress`: four fixed variants and
 * a much taller track, so the 7px meters and their threshold colouring would
 * mean overriding nearly all of its CSS. This one primitive covers every meter.
 *
 * Callers render the value as text beside the meter, which makes the bar a
 * duplicate for screen readers, so it is hidden unless `label` is passed.
 */
const MeterBar = ({
  percentage, color, label, className,
}) => {
  const accessibility = label
    ? {
      role: 'progressbar',
      'aria-label': label,
      'aria-valuenow': Math.round(percentage),
      'aria-valuemin': 0,
      'aria-valuemax': 100,
    }
    : { 'aria-hidden': true };

  return (
    <div className={`dashboard-meter ${className || ''}`} {...accessibility}>
      <span
        className="dashboard-meter__fill"
        style={{ width: `${clamp(percentage)}%`, backgroundColor: color }}
      />
    </div>
  );
};

MeterBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  /** Set only when the value is not already rendered as text beside the meter. */
  label: PropTypes.string,
  className: PropTypes.string,
};

export default MeterBar;
