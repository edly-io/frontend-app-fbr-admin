import React from 'react';
import PropTypes from 'prop-types';

/**
 * `id` is what the surrounding `<section aria-labelledby>` points at, so a
 * section that names its heading this way stays correctly labelled - without
 * it the reference dangles and the section is announced unlabelled.
 */
const SectionHeading = ({
  id, title, subtitle, action,
}) => (
  <div className="dashboard-section__heading d-flex align-items-baseline">
    <h2 className="dashboard-section__title mb-0" id={id}>{title}</h2>
    {subtitle && <span className="dashboard-section__subtitle">{subtitle}</span>}
    {action && <span className="dashboard-section__action ml-auto">{action}</span>}
  </div>
);

SectionHeading.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
};

SectionHeading.defaultProps = {
  id: undefined,
  subtitle: undefined,
  action: undefined,
};

export default SectionHeading;
