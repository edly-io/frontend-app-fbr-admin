import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import MeterBar from './MeterBar';
import StarRating from './StarRating';
import { RATING_COLORS, TONE_COLORS } from './constants';
import { RATING_IDS } from './data/mockData';
import messages from './messages';

const RATING_MESSAGES = {
  [RATING_IDS.excellent]: messages.ratingExcellent,
  [RATING_IDS.veryGood]: messages.ratingVeryGood,
  [RATING_IDS.good]: messages.ratingGood,
  [RATING_IDS.fair]: messages.ratingFair,
  [RATING_IDS.poor]: messages.ratingPoor,
};

const getInitials = name => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(word => word[0])
  .join('')
  .toUpperCase();

const InstructorRating = ({ instructor, caption, tone }) => (
  <li className="dashboard-feedback__instructor d-flex align-items-center">
    <span
      className="dashboard-feedback__initials"
      style={{ backgroundColor: tone.surface, color: tone.color }}
      aria-hidden
    >
      {getInitials(instructor.name)}
    </span>
    <span className="dashboard-feedback__instructor-text">
      <span className="dashboard-feedback__instructor-name">{instructor.name}</span>
      <span className="dashboard-feedback__instructor-caption">{caption}</span>
    </span>
    <span className="dashboard-feedback__instructor-score" style={{ color: tone.color }}>
      {instructor.score.toFixed(1)}
    </span>
  </li>
);

InstructorRating.propTypes = {
  instructor: PropTypes.shape({
    name: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
  }).isRequired,
  caption: PropTypes.string.isRequired,
  tone: PropTypes.shape({
    color: PropTypes.string.isRequired,
    surface: PropTypes.string.isRequired,
  }).isRequired,
};

const FeedbackOverview = ({ feedbackMetrics }) => {
  const intl = useIntl();
  const {
    averageRating, maximumRating, responded, invited, responseRate,
    distribution, highestRated, lowestRated, quote,
  } = feedbackMetrics;

  return (
    <section className="dashboard-section h-100" aria-labelledby="dashboard-feedback-heading">
      <Card className="dashboard-card h-100">
        <div className="dashboard-card__header d-flex align-items-baseline">
          <h2 className="dashboard-card__title mb-0" id="dashboard-feedback-heading">
            {intl.formatMessage(messages.feedbackTitle)}
          </h2>
          <span className="dashboard-card__subtitle">
            {intl.formatMessage(messages.feedbackSubtitle)}
          </span>
        </div>

        <Card.Section className="dashboard-card__body">
          <div className="dashboard-feedback__top d-flex align-items-center">
            <div>
              <p className="dashboard-figure mb-0">
                {averageRating.toFixed(1)}
                <small className="dashboard-figure__unit">
                  {intl.formatMessage(messages.feedbackRatingOutOf, { maximum: maximumRating })}
                </small>
              </p>
              <StarRating
                rating={averageRating}
                maximum={maximumRating}
                label={intl.formatMessage(messages.feedbackStarsLabel, {
                  rating: averageRating.toFixed(1),
                  maximum: maximumRating,
                })}
              />
            </div>
            <div className="dashboard-feedback__response">
              <p className="dashboard-feedback__response-value mb-0">
                {intl.formatMessage(messages.percentageValue, {
                  percentage: Math.round(responseRate),
                })}
              </p>
              <p className="dashboard-feedback__response-label mb-0">
                {intl.formatMessage(messages.feedbackResponded, { responded, invited })}
              </p>
            </div>
          </div>

          <ul className="dashboard-feedback__distribution list-unstyled mb-0">
            {distribution.map(band => (
              <li className="dashboard-feedback__band" key={band.id}>
                <span className="dashboard-feedback__band-label">
                  {intl.formatMessage(RATING_MESSAGES[band.id])}
                </span>
                <MeterBar
                  percentage={band.percentage}
                  color={RATING_COLORS[band.id]}
                  className="dashboard-feedback__band-meter"
                />
                <span className="dashboard-feedback__band-value">
                  {intl.formatMessage(messages.percentageValue, { percentage: band.percentage })}
                </span>
              </li>
            ))}
          </ul>

          <ul className="dashboard-feedback__instructors list-unstyled mb-0">
            <InstructorRating
              instructor={highestRated}
              caption={intl.formatMessage(messages.feedbackHighestRated, {
                program: highestRated.program,
              })}
              tone={{ color: TONE_COLORS.positive, surface: '#F1F8F5' }}
            />
            <InstructorRating
              instructor={lowestRated}
              caption={intl.formatMessage(messages.feedbackLowestRated, {
                program: lowestRated.program,
              })}
              tone={{ color: TONE_COLORS.negative, surface: '#FBF2F3' }}
            />
          </ul>

          <figure className="dashboard-feedback__quote mb-0">
            <blockquote className="dashboard-feedback__quote-text mb-0">
              {quote.text}
            </blockquote>
            <figcaption className="dashboard-feedback__quote-meta">
              {intl.formatMessage(messages.feedbackQuoteAttribution, {
                respondent: quote.respondent,
                program: quote.program,
              })}
            </figcaption>
          </figure>
        </Card.Section>
      </Card>
    </section>
  );
};

FeedbackOverview.propTypes = {
  feedbackMetrics: PropTypes.shape({
    averageRating: PropTypes.number.isRequired,
    maximumRating: PropTypes.number.isRequired,
    responded: PropTypes.number.isRequired,
    invited: PropTypes.number.isRequired,
    responseRate: PropTypes.number.isRequired,
    distribution: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
    })).isRequired,
    highestRated: PropTypes.shape({
      name: PropTypes.string.isRequired,
      program: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
    }).isRequired,
    lowestRated: PropTypes.shape({
      name: PropTypes.string.isRequired,
      program: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
    }).isRequired,
    quote: PropTypes.shape({
      text: PropTypes.string.isRequired,
      respondent: PropTypes.string.isRequired,
      program: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FeedbackOverview;
