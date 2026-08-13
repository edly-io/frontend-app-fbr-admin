import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { StarBorder, StarFilled } from '@openedx/paragon/icons';

/** A star counts as filled once the rating is within a quarter point of it. */
const FILL_TOLERANCE = 0.25;

const StarRating = ({ rating, maximum, label }) => (
  <span className="dashboard-stars" role="img" aria-label={label}>
    {Array.from({ length: maximum }, (_, index) => {
      const isFilled = rating >= index + 1 - FILL_TOLERANCE;
      return (
        <Icon
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          src={isFilled ? StarFilled : StarBorder}
          className={`dashboard-stars__star dashboard-stars__star--${isFilled ? 'on' : 'off'}`}
        />
      );
    })}
  </span>
);

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maximum: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default StarRating;
