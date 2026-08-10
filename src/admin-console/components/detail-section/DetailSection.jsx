import React from 'react';
import PropTypes from 'prop-types';
import './detail-section-styles.scss';

const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <p className="detail-section__title">{title}</p>
    <div className="detail-section__grid">
      {children}
    </div>
  </div>
);

DetailSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default DetailSection;
